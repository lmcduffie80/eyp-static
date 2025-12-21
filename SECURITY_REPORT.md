# Security Assessment Report
## Externally Yours Productions Website

**Date:** Current Assessment
**Scope:** Static HTML/CSS/JavaScript files

---

## Security Issues Found

### ✅ FIXED: Missing rel="noopener noreferrer" on External Links

**Issue:** One external link (`target="_blank"`) was missing the `rel="noopener noreferrer"` attribute.

**Location:** `videography.html` line 1153

**Risk:** Medium - Without these attributes, the new page can access `window.opener` and potentially redirect the original page or access sensitive information.

**Status:** ✅ Fixed - Added `rel="noopener noreferrer"` to the link.

---

## Best Practices Review

### ⚠️ Inline Event Handlers

**Issue:** Use of inline event handlers (`onclick`, `onerror`) throughout the codebase.

**Locations:**
- `videography.html`: `onerror` on img tag (line 973), `onclick` on modal close (line 1140)
- `photography.html`: Multiple `onclick` handlers for gallery functions
- `index.html`: Multiple `onclick` handlers for gallery functions

**Risk:** Low to Medium - While inline handlers work, they:
1. Can be blocked by Content Security Policy (CSP)
2. Mix HTML and JavaScript concerns
3. Can be exploited if user input reaches these handlers (not the case here)

**Recommendation:** Consider refactoring to use event listeners in JavaScript files for better maintainability and CSP compatibility.

**Current Status:** Acceptable for static site, but not ideal for production with strict CSP.

---

## Security Strengths

### ✅ Good Practices Found

1. **Most External Links Protected:** Almost all `target="_blank"` links have `rel="noopener noreferrer"` ✅
2. **No User Input Processing:** Static site with no forms that process user data (Honeybook widget handles forms) ✅
3. **HTTPS Resources:** All external resources (YouTube, Honeybook) use HTTPS ✅
4. **No Inline Scripts with User Data:** No scripts that process or display untrusted user input ✅
5. **Trusted External Sources:** Only loading resources from trusted domains (YouTube, Honeybook) ✅

---

## Additional Recommendations

### 1. Content Security Policy (CSP)

**Recommendation:** Add CSP headers server-side to restrict resource loading:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://www.honeybook.com; img-src 'self' https://img.youtube.com data:; frame-src https://www.youtube.com https://www.honeybook.com; style-src 'self' 'unsafe-inline';
```

**Impact:** Prevents XSS attacks by restricting where scripts can load from.

### 2. X-Frame-Options Header

**Recommendation:** Add `X-Frame-Options: SAMEORIGIN` header to prevent clickjacking.

### 3. HTTPS Enforcement

**Recommendation:** Ensure the site is served over HTTPS and consider adding HSTS headers.

### 4. Subresource Integrity (SRI)

**Recommendation:** If possible, add SRI hashes to external scripts for integrity verification.

---

## Overall Security Rating

**Grade: B+ (Good)**

The website has good basic security practices in place. The main areas for improvement are:
1. ✅ Fixed missing rel attributes on external links
2. Consider refactoring inline event handlers for CSP compatibility
3. Implement CSP headers server-side
4. Add security headers (X-Frame-Options, HSTS)

For a static marketing website, the current security posture is acceptable, especially given that there's no user input processing or sensitive data handling on the client side.

---

## Notes

- All user-submitted data is handled by Honeybook's secure widget
- No authentication or authorization required (public marketing site)
- No database or server-side processing
- All external resources use HTTPS

