// API endpoint to fetch Google Calendar events
// This endpoint fetches events from Google Calendar and returns dates that should be blocked
// Also includes blocked dates from the database

import { setSecurityHeaders, setCORSHeaders } from './security-headers.js';
import sql from './db/connection.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers
    setCORSHeaders(req, res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Get Google Calendar ID from environment variable
        const calendarId = process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_EMAIL;
        
        if (!calendarId) {
            return res.status(500).json({
                success: false,
                error: 'Google Calendar ID not configured. Please set GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_EMAIL environment variable.'
            });
        }

        // Get API key from environment variable
        const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'Google Calendar API key not configured. Please set GOOGLE_CALENDAR_API_KEY environment variable.'
            });
        }

        // Calculate date range (next 12 months)
        const today = new Date();
        const timeMin = today.toISOString();
        const oneYearFromNow = new Date(today);
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        const timeMax = oneYearFromNow.toISOString();

        // Fetch events from Google Calendar API
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Calendar API error:', response.status, errorText);
            return res.status(500).json({
                success: false,
                error: `Failed to fetch calendar events: ${response.status} ${response.statusText}`
            });
        }

        const data = await response.json();
        
        // Extract blocked dates (dates with one or more events)
        const blockedDates = new Set();
        
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(event => {
                if (event.start) {
                    let eventDate;
                    
                    // Handle all-day events (date) vs timed events (dateTime)
                    if (event.start.date) {
                        eventDate = event.start.date; // YYYY-MM-DD format
                    } else if (event.start.dateTime) {
                        // Extract date from datetime
                        eventDate = event.start.dateTime.split('T')[0];
                    }
                    
                    if (eventDate) {
                        // Check if it's a Saturday (day 6 in JavaScript Date, where 0 = Sunday)
                        const dateObj = new Date(eventDate + 'T00:00:00');
                        if (dateObj.getDay() === 6) {
                            blockedDates.add(eventDate);
                        }
                    }
                }
            });
        }

        // Also fetch blocked dates from database (approved blocked dates)
        try {
            const blockedDatesResult = await sql`
                SELECT date FROM blocked_dates 
                WHERE status = 'approved' OR status IS NULL
            `;
            
            blockedDatesResult.rows.forEach(row => {
                if (row.date) {
                    // Format date to YYYY-MM-DD
                    let dateStr = row.date;
                    if (dateStr instanceof Date) {
                        const year = dateStr.getFullYear();
                        const month = String(dateStr.getMonth() + 1).padStart(2, '0');
                        const day = String(dateStr.getDate()).padStart(2, '0');
                        dateStr = `${year}-${month}-${day}`;
                    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
                        dateStr = dateStr.split('T')[0];
                    }
                    
                    // Check if it's a Saturday
                    const dateObj = new Date(dateStr + 'T00:00:00');
                    if (dateObj.getDay() === 6) {
                        blockedDates.add(dateStr);
                    }
                }
            });
        } catch (dbError) {
            console.error('Error fetching blocked dates from database:', dbError);
            // Continue without database blocked dates if there's an error
        }

        // Convert Set to sorted array
        const blockedDatesArray = Array.from(blockedDates).sort();

        return res.status(200).json({
            success: true,
            data: {
                blockedDates: blockedDatesArray,
                totalEvents: data.items?.length || 0,
                blockedSaturdays: blockedDatesArray.length
            }
        });

    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch calendar events'
        });
    }
}

