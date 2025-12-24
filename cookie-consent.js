/**
 * Cookie Consent Banner
 * Displays a cookie consent banner and manages user's cookie preferences
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

// Cookie consent management
const CookieConsent = {
    cookieName: 'eyp_cookie_consent',
    consentGiven: false,
    
    init: function() {
        // Check if consent has been given
        const consent = getCookie(this.cookieName);
        if (consent === 'accepted') {
            this.consentGiven = true;
            return; // Don't show banner if already accepted
        }
        
        // Show banner if consent not given
        this.showBanner();
    },
    
    showBanner: function() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(26, 26, 26, 0.98);
                color: white;
                padding: 1.5rem 2rem;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 1rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            ">
                <div style="flex: 1; min-width: 250px;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; font-size: 1.1rem;">
                        🍪 We Use Cookies
                    </div>
                    <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.9); line-height: 1.5;">
                        We use cookies to analyze website traffic and improve your experience. 
                        By clicking "Accept", you consent to our use of cookies. 
                        <a href="#" id="cookie-policy-link" style="color: #ff6b35; text-decoration: underline;">Learn more</a>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button id="cookie-consent-decline" style="
                        padding: 0.75rem 1.5rem;
                        background: transparent;
                        color: white;
                        border: 2px solid white;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    ">Decline</button>
                    <button id="cookie-consent-accept" style="
                        padding: 0.75rem 1.5rem;
                        background: #ff6b35;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">Accept</button>
                </div>
            </div>
        `;
        
        // Add styles for mobile responsiveness
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                #cookie-consent-banner > div {
                    flex-direction: column;
                    text-align: center;
                }
                #cookie-consent-banner > div > div:first-child {
                    width: 100%;
                }
                #cookie-consent-banner > div > div:last-child {
                    width: 100%;
                    justify-content: center;
                }
                #cookie-consent-banner button {
                    flex: 1;
                }
            }
            #cookie-consent-banner button:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }
            #cookie-consent-banner #cookie-consent-accept:hover {
                background: #e55a2b;
            }
            #cookie-consent-banner #cookie-consent-decline:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(banner);
        
        // Add event listeners
        document.getElementById('cookie-consent-accept').addEventListener('click', () => {
            this.accept();
        });
        
        document.getElementById('cookie-consent-decline').addEventListener('click', () => {
            this.decline();
        });
        
        // Cookie policy link (optional - can link to a privacy policy page)
        document.getElementById('cookie-policy-link').addEventListener('click', (e) => {
            e.preventDefault();
            alert('Cookie Policy: We use cookies to analyze website traffic and improve user experience. Cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. You can decline cookies, but some features may not work properly.');
        });
    },
    
    accept: function() {
        // Set cookie for 365 days
        setCookie(this.cookieName, 'accepted', 365);
        this.consentGiven = true;
        this.hideBanner();
        
        // Enable analytics tracking if analytics.js is loaded
        if (typeof trackPageView === 'function') {
            trackPageView();
        }
    },
    
    decline: function() {
        // Set cookie for 365 days to remember the choice
        setCookie(this.cookieName, 'declined', 365);
        this.consentGiven = false;
        this.hideBanner();
        
        // Don't track analytics if declined
        console.log('Analytics tracking declined by user');
    },
    
    hideBanner: function() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    },
    
    hasConsent: function() {
        const consent = getCookie(this.cookieName);
        return consent === 'accepted';
    }
};

// Add slide-down animation
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyle);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        CookieConsent.init();
    });
} else {
    CookieConsent.init();
}

// Export for use in analytics.js
window.CookieConsent = CookieConsent;

