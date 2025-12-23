// AWS Configuration Example for Frontend
// Update this with your actual AWS API Gateway endpoint

const AWS_CONFIG = {
    // API Gateway endpoint (replace with your actual endpoint)
    API_BASE_URL: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod',
    
    // Cognito configuration (if using Cognito directly from frontend)
    COGNITO: {
        UserPoolId: 'us-east-1_XXXXXXXXX',
        ClientId: 'your-client-id',
        Region: 'us-east-1'
    },
    
    // S3 configuration (if uploading files)
    S3: {
        Bucket: 'eyp-static-uploads',
        Region: 'us-east-1'
    }
};

// Example: Update authentication function
async function loginWithAWS(username, password) {
    try {
        const response = await fetch(`${AWS_CONFIG.API_BASE_URL}/api/dj-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Store tokens (consider using httpOnly cookies via backend)
            localStorage.setItem('dj_token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('dj_refresh_token', data.refreshToken);
            }
            
            // Store token expiry
            const expiry = Date.now() + (data.expiresIn * 1000);
            localStorage.setItem('dj_token_expiry', expiry.toString());
            
            return { success: true };
        }
        
        return { success: false, message: data.message };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Example: Get bookings from DynamoDB via API
async function getBookingsFromAWS() {
    const token = localStorage.getItem('dj_token');
    
    try {
        const response = await fetch(`${AWS_CONFIG.API_BASE_URL}/api/dj-bookings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, try refresh
                await refreshToken();
                return getBookingsFromAWS(); // Retry
            }
            throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        return data.bookings || [];
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

// Example: Save blocked date to DynamoDB
async function blockDateOnAWS(date, reason) {
    const token = localStorage.getItem('dj_token');
    
    try {
        const response = await fetch(`${AWS_CONFIG.API_BASE_URL}/api/dj-block-date`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: date,
                reason: reason || 'No reason provided'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to block date');
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error blocking date:', error);
        return { success: false, error: error.message };
    }
}

// Example: Refresh token if expired
async function refreshToken() {
    const refreshToken = localStorage.getItem('dj_refresh_token');
    
    if (!refreshToken) {
        // Redirect to login
        window.location.href = 'dj-login.html';
        return;
    }
    
    try {
        const response = await fetch(`${AWS_CONFIG.API_BASE_URL}/api/dj-refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });
        
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('dj_token', data.token);
            const expiry = Date.now() + (data.expiresIn * 1000);
            localStorage.setItem('dj_token_expiry', expiry.toString());
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Token refresh error:', error);
        // Redirect to login
        window.location.href = 'dj-login.html';
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AWS_CONFIG,
        loginWithAWS,
        getBookingsFromAWS,
        blockDateOnAWS,
        refreshToken
    };
}

