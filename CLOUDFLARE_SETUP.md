# FASD Compass — Cloudflare Pages Setup Guide

## Why Cloudflare Pages?

- Free forever — unlimited bandwidth
- Enterprise-grade security (WAF, DDoS protection, bot blocking) — all free
- 300+ global edge locations — faster than Netlify for UK users
- Direct GitHub integration — auto-deploys on every push
- Harder to hack than Netlify — Cloudflare protects 20% of the internet
- Built-in analytics (no cookies, GDPR-compliant)

---

## Method A — Drag & Drop (Quickest — no GitHub needed)

1. Go to **dash.cloudflare.com** → sign up free
2. Enable 2FA immediately: **My Profile → Authentication → Two-Factor Authentication**
3. Click **Workers & Pages** in the left menu
4. Click **Create application → Pages → Upload assets**
5. Name your project: `fasd-compass`
6. Drag the entire contents of this folder onto the upload zone
7. Click **Deploy site**
8. ✅ Live at `fasd-compass.pages.dev`

---

## Method B — GitHub Integration (Recommended — auto-deploys forever)

### Step 1 — Create Cloudflare account
1. Go to **dash.cloudflare.com** → sign up free
2. Enable 2FA: My Profile → Authentication → Two-Factor Authentication → Enable
   Use an authenticator app (Authy, Google Authenticator) — not SMS

### Step 2 — Connect GitHub
1. In Cloudflare dashboard → **Workers & Pages**
2. Click **Create application → Pages → Connect to Git**
3. Click **Connect GitHub** → authorise Cloudflare to read your repositories
4. Select your **fasd-compass** repository
5. Click **Begin setup**

### Step 3 — Configure build settings
On the configuration screen, leave build settings **completely blank**:
- Project name: `fasd-compass`
- Production branch: `main`
- Build command: *(leave empty)*
- Build output directory: *(leave empty or enter `/`)*
- Root directory: *(leave empty)*

Click **Save and Deploy**

Your site deploys in under 60 seconds.
Live at: `https://fasd-compass.pages.dev`

### Step 4 — Connect myfasdguide.org

1. In your Cloudflare Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `myfasdguide.org`
4. Cloudflare shows you DNS records to add

**If your domain is at Namecheap:**
1. Log into Namecheap → Domain List → **Manage** → **Advanced DNS**
2. Delete any existing A records for `@`
3. Add these records (Cloudflare will give you the exact values):

```
Type    Host    Value                           TTL
CNAME   @       fasd-compass.pages.dev          Automatic
CNAME   www     fasd-compass.pages.dev          Automatic
```

> ⚠️ If Namecheap won't let you add a CNAME for `@` (apex domain),
> use Cloudflare's nameservers instead (see below)

**To use Cloudflare nameservers (best option):**
1. Cloudflare dashboard → Add a site → enter `myfasdguide.org`
2. Choose Free plan → Continue
3. Cloudflare scans your DNS → Continue
4. Copy the two Cloudflare nameservers (e.g. `ada.ns.cloudflare.com`)
5. In Namecheap → Domain → Nameservers → Custom DNS → paste both
6. Click Save — propagates in 10–30 minutes
7. Back in Cloudflare → DNS → Add record → CNAME @ → fasd-compass.pages.dev

HTTPS is automatic — Cloudflare issues a free SSL certificate.

---

## Step 5 — Enable Security Features (Free)

### WAF (Web Application Firewall)
1. Cloudflare dashboard → your domain → **Security → WAF**
2. Enable **OWASP Core Ruleset** — blocks SQL injection, XSS, and common attacks
3. Set to **Block** mode

### Bot Protection
1. Security → **Bots**
2. Enable **Bot Fight Mode** — free, blocks automated attacks

### Rate Limiting (prevents brute force)
1. Security → **WAF → Rate limiting rules**
2. Add rule: if requests > 100/minute from one IP → Challenge

### DDoS Protection
Already enabled automatically on all Cloudflare sites — no configuration needed.

---

## Step 6 — Optional: Auto-deploy via GitHub Actions

To trigger Cloudflare deploys automatically from GitHub:

1. In Cloudflare → **My Profile → API Tokens → Create Token**
2. Use template: **Edit Cloudflare Workers** → Customize:
   - Permissions: Account → Cloudflare Pages → Edit
   - Account Resources: Your account
3. Copy the token

4. In GitHub → your repository → **Settings → Secrets and variables → Actions**
5. Add secrets:
   - `CLOUDFLARE_API_TOKEN` → paste the token
   - `CLOUDFLARE_ACCOUNT_ID` → found in Cloudflare dashboard right sidebar
6. Add variable:
   - `CLOUDFLARE_ENABLED` → `true`

Now every push to `main` deploys to **both** GitHub Pages AND Cloudflare Pages.

---

## DNS Quick Reference

### Records at your domain registrar:

| Type  | Name | Value                      | Purpose              |
|-------|------|----------------------------|----------------------|
| CNAME | @    | fasd-compass.pages.dev     | Apex domain          |
| CNAME | www  | fasd-compass.pages.dev     | www redirect         |

### GitHub Pages DNS (backup — if switching away from Cloudflare):

| Type | Name | Value           |
|------|------|-----------------|
| A    | @    | 185.199.108.153 |
| A    | @    | 185.199.109.153 |
| A    | @    | 185.199.110.153 |
| A    | @    | 185.199.111.153 |

---

## Security Checklist After Setup

- [ ] Cloudflare account 2FA enabled
- [ ] GitHub account 2FA enabled  
- [ ] Email account 2FA enabled
- [ ] WAF managed rules enabled (Security → WAF)
- [ ] Bot Fight Mode enabled (Security → Bots)
- [ ] HTTPS enforced (SSL/TLS → Always Use HTTPS = On)
- [ ] HSTS enabled (SSL/TLS → Edge Certificates → HSTS)
- [ ] Security headers confirmed (test at securityheaders.com)

---

## Testing Your Security Headers

After deploying, visit: **https://securityheaders.com**

Enter `https://myfasdguide.org` — you should see an **A or A+ rating**.

The `_headers` file in this repository pre-configures all recommended headers.

---

## Troubleshooting

**Site shows "Page not found" after deploy:**
Check that `_redirects` file is in the root of your repository.
In Cloudflare → your project → **Deployments** → check the latest build log.

**Custom domain not working:**
DNS changes take 10–60 minutes. Check propagation at: whatsmydns.net

**Security headers not showing:**
Cloudflare Pages reads `_headers` from the root of your deployed files.
Make sure `_headers` is in the repository root, not in a subfolder.

**Deploy not triggering:**
Check GitHub → Repository → Actions tab for error messages.
Most common cause: branch name is not `main` (check your repository default branch).

---

## Companion Resources

- FASD Compass live site: https://myfasdguide.org
- Cloudflare Pages docs: https://developers.cloudflare.com/pages
- Security headers test: https://securityheaders.com
- DNS propagation check: https://whatsmydns.net
- GitHub Pages docs: https://docs.github.com/pages
