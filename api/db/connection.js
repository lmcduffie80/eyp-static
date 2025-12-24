// Database connection helper for AWS RDS Postgres with IAM authentication
// This works with AWS RDS via Vercel using IAM authentication

// Check which connection method to use
const useVercelPostgres = !!process.env.POSTGRES_URL;
const useAWSSigner = !!(
    process.env.AWS_ROLE_ARN &&
    process.env.PGHOST &&
    process.env.PGUSER
);

// Cache for AWS signer and pool (to avoid recreating on every request)
let awsSigner = null;
let awsPool = null;
let signerInitialized = false;

/**
 * Initialize AWS RDS signer if needed
 */
async function initAWSSigner() {
    if (signerInitialized || !useAWSSigner || useVercelPostgres) {
        return;
    }

    try {
        const { Signer } = await import("@aws-sdk/rds-signer");
        const { awsCredentialsProvider } = await import("@vercel/oidc-aws-credentials-provider");
        
        awsSigner = new Signer({
            hostname: process.env.PGHOST,
            port: Number(process.env.PGPORT || 5432),
            username: process.env.PGUSER,
            region: process.env.AWS_REGION || "us-east-1",
            credentials: awsCredentialsProvider({
                roleArn: process.env.AWS_ROLE_ARN,
                clientConfig: { region: process.env.AWS_REGION || "us-east-1" },
            }),
        });
        
        signerInitialized = true;
    } catch (error) {
        console.error("Failed to initialize AWS signer:", error);
        throw error;
    }
}

/**
 * Get AWS RDS connection pool
 * Creates a new pool if needed, or returns existing one
 * Note: Auth tokens expire after 15 minutes, but pg Pool handles reconnection
 */
async function getAWSPool() {
    await initAWSSigner();
    
    if (!awsPool && awsSigner) {
        const { Pool } = await import("pg");
        const authToken = await awsSigner.getAuthToken();
        
        awsPool = new Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            database: process.env.PGDATABASE || "postgres",
            password: authToken,
            port: Number(process.env.PGPORT || 5432),
            ssl: { rejectUnauthorized: false },
            // Connection pool settings
            max: 1, // Serverless functions - use 1 connection per instance
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }
    
    return awsPool;
}

/**
 * Convert tagged template literal to parameterized query
 * Example: sql`SELECT * FROM users WHERE id = ${id}` 
 * Becomes: { query: "SELECT * FROM users WHERE id = $1", values: [id] }
 */
function convertTemplateToQuery(queryParts, ...values) {
    let query = queryParts[0];
    const queryValues = [];
    
    for (let i = 0; i < values.length; i++) {
        queryValues.push(values[i]);
        query += "$" + (i + 1);
        if (i < queryParts.length - 1) {
            query += queryParts[i + 1];
        }
    }
    
    return { query, values: queryValues };
}

/**
 * Execute a SQL query using template literals
 * Works with both Vercel Postgres (connection string) and AWS RDS (IAM auth)
 * 
 * Usage: await sql`SELECT * FROM bookings WHERE id = ${id}`
 */
export default async function sql(queryParts, ...values) {
    // If we have POSTGRES_URL, use @vercel/postgres (simpler)
    if (useVercelPostgres) {
        const { sql: vercelSql } = await import("@vercel/postgres");
        return await vercelSql(queryParts, ...values);
    }

    // Otherwise, use AWS RDS with IAM authentication
    if (useAWSSigner) {
        const pool = await getAWSPool();
        if (!pool) {
            throw new Error("Failed to create AWS RDS connection pool");
        }

        const { query, values: queryValues } = convertTemplateToQuery(queryParts, ...values);
        const result = await pool.query(query, queryValues);
        
        // Return in same format as @vercel/postgres
        return { rows: result.rows };
    }

    throw new Error(
        "No database connection configured. " +
        "Missing POSTGRES_URL or AWS credentials (AWS_ROLE_ARN, PGHOST, PGUSER)."
    );
}
