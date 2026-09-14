# Security Policy

## FASD Compass — Security

FASD Compass is a static Progressive Web App containing no server-side code,
no database, no user accounts, and no data collection. This significantly
limits the attack surface.

## Supported Versions

| Version | Supported |
|---|---|
| Latest (main branch) | ✅ |
| Previous releases | ❌ |

Always use the latest version from the main branch.

## Reporting a Vulnerability

If you discover a security vulnerability in FASD Compass, please report it
responsibly:

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: secretary-drtakonpa@hotmail.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

We will respond within 5 working days and aim to release a fix within 14 days
of confirmed vulnerabilities.

## Security Measures

This application implements:
- Content Security Policy (CSP) headers
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restricting camera, microphone, geolocation
- Service worker with controlled caching
- No external API calls (fully offline-capable)
- No cookies, localStorage, or user data collection
