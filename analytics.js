/**
 * Cookie-based Analytics Tracking
 * Tracks visitors, page views, sessions, and user behavior
 */

// Cookie helper functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function generateVisitorId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create visitor ID (stored in cookie for 365 days)
function getVisitorId() {
    let visitorId = getCookie('eyp_visitor_id');
    if (!visitorId) {
        visitorId = generateVisitorId();
        setCookie('eyp_visitor_id', visitorId, 365);
    }
    return visitorId;
}

// Get or create session ID (stored in sessionStorage for current session)
function getSessionId() {
    let sessionId = sessionStorage.getItem('eyp_session_id');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('eyp_session_id', sessionId);
        sessionStorage.setItem('eyp_session_start', new Date().toISOString());
    }
    return sessionId;
}

// Get device type from user agent
function getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        return 'Tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// Get referrer source
function getReferrerSource(referrer) {
    if (!referrer || referrer === '') return 'Direct';
    
    try {
        const url = new URL(referrer);
        const hostname = url.hostname.toLowerCase();
        
        if (hostname.includes('google')) return 'Google';
        if (hostname.includes('facebook')) return 'Facebook';
        if (hostname.includes('instagram')) return 'Instagram';
        if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X';
        if (hostname.includes('linkedin')) return 'LinkedIn';
        if (hostname.includes('bing')) return 'Bing';
        if (hostname.includes('yahoo')) return 'Yahoo';
        
        // Check if it's from the same domain
        if (hostname === window.location.hostname || hostname.includes(window.location.hostname)) {
            return 'Internal';
        }
        
        return 'Other';
    } catch (e) {
        return 'Other';
    }
}

// Initialize analytics data structure
function initializeAnalytics() {
    if (!localStorage.getItem('analytics_data')) {
        const initialData = {
            visits: [],
            pageViews: [],
            sessions: {},
            uniqueVisitors: new Set(),
            lastReset: new Date().toISOString()
        };
        localStorage.setItem('analytics_data', JSON.stringify(initialData));
    }
}

// Load analytics data
function loadAnalyticsData() {
    const data = JSON.parse(localStorage.getItem('analytics_data') || '{}');
    // Convert uniqueVisitors Set to Array for JSON compatibility
    if (data.uniqueVisitors && typeof data.uniqueVisitors === 'object' && !Array.isArray(data.uniqueVisitors)) {
        data.uniqueVisitors = Array.from(Object.keys(data.uniqueVisitors));
    } else if (!data.uniqueVisitors) {
        data.uniqueVisitors = [];
    }
    return data;
}

// Save analytics data
function saveAnalyticsData(data) {
    // Convert uniqueVisitors array back to Set-like object for storage
    if (Array.isArray(data.uniqueVisitors)) {
        const uniqueSet = {};
        data.uniqueVisitors.forEach(v => uniqueSet[v] = true);
        data.uniqueVisitors = uniqueSet;
    }
    localStorage.setItem('analytics_data', JSON.stringify(data));
}

// Track page view
function trackPageView() {
    initializeAnalytics();
    const analytics = loadAnalyticsData();
    
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const referrer = document.referrer || '';
    const referrerSource = getReferrerSource(referrer);
    const userAgent = navigator.userAgent;
    const deviceType = getDeviceType();
    const timestamp = new Date().toISOString();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Track unique visitor
    if (!analytics.uniqueVisitors[visitorId]) {
        analytics.uniqueVisitors[visitorId] = true;
    }
    
    // Create visit record
    const visit = {
        visitorId: visitorId,
        sessionId: sessionId,
        timestamp: timestamp,
        page: page,
        referrer: referrer,
        referrerSource: referrerSource,
        userAgent: userAgent,
        deviceType: deviceType,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        url: window.location.href
    };
    
    analytics.visits.push(visit);
    analytics.pageViews.push({
        page: page,
        timestamp: timestamp,
        visitorId: visitorId,
        sessionId: sessionId
    });
    
    // Track session
    if (!analytics.sessions[sessionId]) {
        analytics.sessions[sessionId] = {
            visitorId: visitorId,
            startTime: timestamp,
            pageViews: 0,
            pages: [],
            deviceType: deviceType,
            referrerSource: referrerSource
        };
    }
    
    analytics.sessions[sessionId].pageViews++;
    if (!analytics.sessions[sessionId].pages.includes(page)) {
        analytics.sessions[sessionId].pages.push(page);
    }
    analytics.sessions[sessionId].lastActivity = timestamp;
    
    // Limit data size (keep last 10,000 visits)
    if (analytics.visits.length > 10000) {
        analytics.visits = analytics.visits.slice(-10000);
    }
    if (analytics.pageViews.length > 10000) {
        analytics.pageViews = analytics.pageViews.slice(-10000);
    }
    
    saveAnalyticsData(analytics);
    
    // Log for debugging (can be removed in production)
    console.log('Page view tracked:', {
        visitorId: visitorId.substring(0, 20) + '...',
        sessionId: sessionId.substring(0, 20) + '...',
        page: page,
        referrerSource: referrerSource,
        deviceType: deviceType
    });
}

// Track time on page when user leaves
function trackTimeOnPage() {
    const sessionId = getSessionId();
    const sessionStart = sessionStorage.getItem('eyp_session_start');
    
    if (sessionStart) {
        const timeOnPage = Date.now() - new Date(sessionStart).getTime();
        const analytics = loadAnalyticsData();
        
        if (analytics.sessions[sessionId]) {
            analytics.sessions[sessionId].duration = (analytics.sessions[sessionId].duration || 0) + timeOnPage;
            saveAnalyticsData(analytics);
        }
    }
}

// Initialize tracking on page load (only if cookie consent given)
function initializeTracking() {
    // Check if cookie consent has been given
    if (typeof CookieConsent !== 'undefined' && CookieConsent.hasConsent()) {
        trackPageView();
    } else if (typeof getCookie === 'function') {
        // Fallback: check cookie directly
        const consent = getCookie('eyp_cookie_consent');
        if (consent === 'accepted') {
            trackPageView();
        }
    } else {
        // If no consent system, track by default (for backward compatibility)
        // In production, you should always require consent
        trackPageView();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for cookie consent banner to initialize
        setTimeout(initializeTracking, 100);
    });
} else {
    setTimeout(initializeTracking, 100);
}

// Track time on page when leaving
window.addEventListener('beforeunload', function() {
    trackTimeOnPage();
});

// Track page visibility changes (when user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        trackTimeOnPage();
    } else {
        sessionStorage.setItem('eyp_session_start', new Date().toISOString());
    }
});

