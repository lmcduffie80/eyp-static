/**
 * API Endpoint: Sync Projects from HoneyBook
 * POST /api/honeybook-sync
 * 
 * Receives project data from HoneyBook (via Zapier webhook or manual sync)
 * Returns formatted project data that can be imported into the dashboard
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        const { projects, webhook_secret } = req.body;

        // Optional: Verify webhook secret for security
        // const expectedSecret = process.env.HONEYBOOK_WEBHOOK_SECRET;
        // if (webhook_secret && webhook_secret !== expectedSecret) {
        //     return res.status(401).json({ 
        //         success: false, 
        //         message: 'Unauthorized' 
        //     });
        // }

        if (!projects || !Array.isArray(projects)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid request: projects array required' 
            });
        }

        // Transform HoneyBook project data to match our format
        const transformedProjects = projects.map((project, index) => {
            // Map HoneyBook fields to our booking format
            // Adjust these mappings based on actual HoneyBook data structure
            const booking = {
                id: project.id || Date.now() + index,
                djUser: project.assigned_to || project.dj_name || project.team_member || '',
                date: formatDate(project.event_date || project.date || project.start_date),
                eventType: project.project_name || project.title || project.name || '',
                location: project.location || project.venue || project.address || '',
                clientName: project.client_name || project.contact_name || '',
                payout: formatCurrency(project.dj_payout || project.payout || project.amount_paid || ''),
                totalRevenue: formatCurrency(project.total_revenue || project.revenue || project.total_amount || ''),
                ccPayment: formatCurrency(project.cc_payment || project.credit_card_payment || ''),
                time: project.event_time || project.time || '',
                contactEmail: project.client_email || project.email || '',
                contactPhone: project.client_phone || project.phone || '',
                notes: project.notes || project.description || ''
            };

            return booking;
        });

        return res.status(200).json({
            success: true,
            message: `Successfully transformed ${transformedProjects.length} projects`,
            projects: transformedProjects
        });

    } catch (error) {
        console.error('HoneyBook sync error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

// Helper function to format date to YYYY-MM-DD
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    return '';
}

// Helper function to format currency (remove $ and commas, return as string)
function formatCurrency(value) {
    if (!value) return '';
    return String(value).replace(/[$,]/g, '').trim();
}

