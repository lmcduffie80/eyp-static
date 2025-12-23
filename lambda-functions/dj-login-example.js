// AWS Lambda Function Example: DJ Login
// This is a template for creating your Lambda function
// Deploy this to AWS Lambda and connect it to API Gateway

const AWS = require('aws-sdk');
const crypto = require('crypto');

// Initialize DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || 'eyp-dj-users';

exports.handler = async (event) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*', // In production, specify your domain
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request body
        const { username, password } = JSON.parse(event.body);

        // Validate input
        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Username and password are required'
                })
            };
        }

        // Get user from DynamoDB
        const params = {
            TableName: USERS_TABLE,
            Key: {
                username: username
            }
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            // User not found
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Invalid username or password'
                })
            };
        }

        const user = result.Item;

        // Verify password (in production, use bcrypt or similar)
        // For now, assuming password is hashed in database
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password + user.salt) // Use salt from database
            .digest('hex');

        if (hashedPassword !== user.passwordHash) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Invalid username or password'
                })
            };
        }

        // Generate JWT token (in production, use AWS Cognito or JWT library)
        const token = generateToken(user);

        // Log successful login (for security auditing)
        console.log(`User ${username} logged in successfully`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token: token,
                user: {
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName
                },
                expiresIn: 1800 // 30 minutes in seconds
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error'
            })
        };
    }
};

// Simple token generation (in production, use AWS Cognito or JWT)
function generateToken(user) {
    const payload = {
        username: user.username,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
    };
    
    // In production, use proper JWT signing with a secret key
    // For now, return a simple base64 encoded payload
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Example: Using AWS Cognito (Recommended)
/*
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { username, password } = JSON.parse(event.body);

        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        };

        const result = await cognito.initiateAuth(params).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token: result.AuthenticationResult.IdToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                expiresIn: result.AuthenticationResult.ExpiresIn
            })
        };
    } catch (error) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Invalid credentials'
            })
        };
    }
};
*/

