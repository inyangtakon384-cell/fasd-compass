# 🧭 FASD Compass

> Evidence-based FASD guidance for parents, teachers, clinicians and families.
> Based on **SIGN 156** (2019, revalidated 2022) and **NICE QS204** (March 2022).

**Live site:** [myfasdguide.org](https://myfasdguide.org)  
**Backup:** [drtakon.github.io/fasd-compass](https://drtakon.github.io/fasd-compass)

---

## About

FASD Compass is a free, open-access Progressive Web App providing:

- 📋 **SIGN 156 / NICE QS204 aligned diagnostic classifications**
- 👨‍👩‍👧 **Parent & carer strategies** (home, regulation, routines)
- 🏫 **School & classroom strategies** for teachers
- 🩺 **Clinical assessment pathway** for GPs, nurses and paediatricians
- ⭐ **Child-friendly section** explaining FASD in accessible language
- 🎙️ **Podcast section** — Early Intervention Matters
- 📋 **10-question FASD screening tool**
- 🤖 **Offline AI knowledge assistant** (no API key, works without internet)
- 📚 **Full evidence base** — SIGN 156, NICE QS204, SNOMED CT codes

Works fully offline after first visit. Installable as a native-like app on Android and iOS.

---

## Deployment Architecture

This repository uses **triple hosting** for maximum resilience:

```
myfasdguide.org
      │
      ├── Primary:  Cloudflare Pages  ← Most secure · Enterprise WAF · Free
      │             Auto-deploy on push · 300+ global locations
      │
      ├── Backup A: GitHub Pages  ← Already set up in this repo
      │             Auto-deploy on push · Microsoft infrastructure
      │
      └── Backup B: Netlify  ← Drag & drop fallback
                    Instant deploy if needed
```

If any host is compromised, switch DNS to another within minutes.
See **CLOUDFLARE_SETUP.md** for full Cloudflare configuration guide.

---

## Deploy to GitHub Pages (Automatic)

GitHub Pages deployment is **fully automatic** via GitHub Actions:

1. Every push to the `main` branch triggers `.github/workflows/deploy.yml`
2. The workflow uploads all files and deploys to GitHub Pages
3. Your site is live within 2 minutes

**First-time setup:**
1. Fork or create this repository on GitHub
2. Go to **Settings → Pages**
3. Under **Build and deployment**, select **GitHub Actions**
4. Push any change to `main` — the workflow runs automatically
5. Your site appears at `https://yourusername.github.io/fasd-compass`

**With custom domain:**
1. The `CNAME` file already contains `myfasdguide.org`
2. Go to **Settings → Pages → Custom domain** → enter `myfasdguide.org`
3. Enable **Enforce HTTPS**
4. Update your DNS at your domain registrar (see DNS section below)

---

## DNS Configuration

To point `myfasdguide.org` to GitHub Pages, set these DNS records at your registrar (Namecheap, GoDaddy etc.):

**For apex domain (myfasdguide.org):**
```
Type  Host  Value              TTL
A     @     185.199.108.153    3600
A     @     185.199.109.153    3600
A     @     185.199.110.153    3600
A     @     185.199.111.153    3600
```

**For www subdomain:**
```
Type   Host  Value                    TTL
CNAME  www   drtakon.github.io        3600
```

DNS changes take 10–60 minutes to propagate.

---

## Switching Between Hosts

### Primary → Netlify
Point domain DNS to Netlify's nameservers or A records (shown in Netlify dashboard).

### Backup → GitHub Pages
Update DNS A records to GitHub's IPs (shown above). Takes 10–60 minutes.

### Emergency switch (fastest)
If Netlify is compromised, update DNS to GitHub IPs immediately.
The site will be live from GitHub Pages within the DNS TTL window.

---

## Security

This repository implements:
- **Content Security Policy** preventing script injection
- **HSTS** forcing HTTPS for 1 year
- **X-Frame-Options: DENY** blocking clickjacking
- **Permissions-Policy** blocking camera, mic, geolocation
- **No server-side code** — pure static files, minimal attack surface
- **No user data collection** — no cookies, no analytics, no accounts

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

### Protecting Your GitHub Account

- ✅ Enable **two-factor authentication**: GitHub → Settings → Password and authentication → 2FA
- ✅ Use a **strong, unique password** not used anywhere else
- ✅ Review **authorised OAuth Apps**: Settings → Applications
- ✅ Check **audit log**: Settings → Security log
- ✅ Never share your GitHub personal access tokens

---

## File Structure

```
fasd-compass/
├── index.html              ← Main app (all content)
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service worker (offline caching)
├── offline.html            ← Offline fallback
├── 404.html                ← SPA redirect handler
├── CNAME                   ← Custom domain config (GitHub Pages)
├── _headers                ← Cloudflare Pages security headers
├── _redirects              ← Cloudflare Pages routing rules
├── _cloudflare.toml        ← Cloudflare Pages full config
├── SECURITY.md             ← Security policy
├── CLOUDFLARE_SETUP.md     ← Step-by-step Cloudflare deployment guide
├── README.md               ← This file
├── icons/
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── .github/
    └── workflows/
        └── deploy.yml      ← Auto-deployment workflow
```

---

## Updating Content

To update the app:

1. Edit `index.html` directly in GitHub (click the file → pencil icon)
2. Commit the change to `main`
3. GitHub Actions automatically deploys within 2 minutes
4. The service worker updates cached content for all users within 60 seconds of their next visit

No command line or technical knowledge required.

---

## Clinical Evidence Base

| Content | Guideline |
|---|---|
| FASD diagnostic classification | SIGN 156 (2019, revalidated 2022) |
| Quality standards | NICE QS204 (March 2022) |
| SNOMED CT codes | NHS Digital (2024) |
| Sentinel facial features | University of Washington Lip-Philtrum Guides |
| UK growth charts | RCPCH / WHO UK charts |
| Screening tools | T-ACE · TWEAK · AUDIT-C |

---

## Author

**Dr Inyang Takon** FRCPCH, FWACP, MRCPCH  
Consultant Neurodevelopmental Paediatrician  
East and North Hertfordshire NHS Trust  
Founder, BrainDiverse Health & BrainDiverse Academy  
Host, *Early Intervention Matters* Podcast  

📧 secretary-drtakonpa@hotmail.com  
🌐 [drtakon.com](https://drtakon.com) · [braindiverse.com](https://braindiverse.com)

---

*This app is for educational purposes. Always seek professional clinical assessment for individual children.*
