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

    // Allow GET for testing
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'HoneyBook Sync API is running. Use POST to sync projects.',
            usage: {
                webhook: 'POST with projects array or single project object from Zapier',
                manual: 'POST with { manual_sync: true } to check sync status'
            }
        });
    }

    // Only allow POST requests for actual syncing
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed. Use POST to sync projects.' 
        });
    }

    try {
        // Log the incoming request for debugging
        console.log('HoneyBook sync request received:', {
            method: req.method,
            body: req.body,
            headers: req.headers
        });

        const { projects, webhook_secret, manual_sync, ...rest } = req.body;

        // Optional: Verify webhook secret for security
        // const expectedSecret = process.env.HONEYBOOK_WEBHOOK_SECRET;
        // if (webhook_secret && webhook_secret !== expectedSecret) {
        //     return res.status(401).json({ 
        //         success: false, 
        //         message: 'Unauthorized' 
        //     });
        // }

        // Handle different data formats from Zapier
        let projectsArray = projects;

        // If no projects array, check if data is sent directly (Zapier sometimes sends single object)
        if (!projectsArray || !Array.isArray(projectsArray)) {
            // Check if the body itself is a project object
            if (req.body && typeof req.body === 'object' && !manual_sync) {
                // Try to extract project data from various possible structures
                if (req.body.id || req.body.project_name || req.body.title || req.body.event_date) {
                    projectsArray = [req.body];
                } else if (req.body.data && Array.isArray(req.body.data)) {
                    projectsArray = req.body.data;
                } else if (req.body.project && typeof req.body.project === 'object') {
                    projectsArray = [req.body.project];
                } else {
                    // For manual sync, return empty array
                    if (manual_sync) {
                        return res.status(200).json({
                            success: true,
                            message: 'Manual sync requested. Webhook data should be sent from Zapier when a project is created/updated.',
                            projects: []
                        });
                    }
                    
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Invalid request: projects array required or single project object',
                        received_data: Object.keys(req.body)
                    });
                }
            } else if (manual_sync) {
                return res.status(200).json({
                    success: true,
                    message: 'Manual sync requested. Webhook data should be sent from Zapier when a project is created/updated.',
                    projects: []
                });
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid request: projects array required',
                    received_data: Object.keys(req.body || {})
                });
            }
        }

        console.log(`Processing ${projectsArray.length} project(s) from HoneyBook`);

        // Transform HoneyBook project data to match our format
        const transformedProjects = projectsArray.map((project, index) => {
            // Log original project data for debugging
            console.log(`Processing project ${index + 1}:`, {
                id: project.id,
                project_name: project.project_name || project.title || project.name,
                event_date: project.event_date || project.date || project.start_date,
                all_keys: Object.keys(project)
            });

            // Map HoneyBook fields to our booking format
            // Adjust these mappings based on actual HoneyBook data structure
            const booking = {
                id: project.id || project.project_id || `hb_${Date.now()}_${index}`,
                djUser: project.assigned_to || project.dj_name || project.team_member || project.assigned_user || '',
                date: formatDate(project.event_date || project.date || project.start_date || project.event_start_date),
                eventType: project.project_name || project.title || project.name || project.project_title || '',
                location: project.location || project.venue || project.address || project.venue_name || '',
                clientName: project.client_name || project.contact_name || project.client || '',
                payout: formatCurrency(project.dj_payout || project.payout || project.amount_paid || project.dj_payment || ''),
                totalRevenue: formatCurrency(project.total_revenue || project.revenue || project.total_amount || project.project_value || ''),
                ccPayment: formatCurrency(project.cc_payment || project.credit_card_payment || project.payment_cc || ''),
                time: project.event_time || project.time || project.start_time || '',
                contactEmail: project.client_email || project.email || project.contact_email || '',
                contactPhone: project.client_phone || project.phone || project.contact_phone || '',
                notes: project.notes || project.description || project.project_notes || ''
            };

            // Log transformed booking for debugging
            console.log(`Transformed project ${index + 1}:`, booking);

            return booking;
        });

        console.log(`Successfully transformed ${transformedProjects.length} project(s)`);

        return res.status(200).json({
            success: true,
            message: `Successfully transformed ${transformedProjects.length} project(s)`,
            projects: transformedProjects,
            original_count: projectsArray.length,
            transformed_count: transformedProjects.length
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

