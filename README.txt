# Seamless Granite & Quartz Co. – Lead Website (Static)

This is a fast, mobile-first lead website for countertops:
- Instant estimate calculator (rough ranges)
- Free measure & quote booking
- Portfolio page
- Edmonton quartz SEO page

## 1) Customize (important)
Replace the placeholders:
- Phone: (780) 231-1005
- Email: ekamjot.s.aulakh22@gmail.com
- Domain placeholder: yourdomain.com (in robots.txt + sitemap.xml)
- Estimate lead email (estimate.html): `<meta name="lead-email" content="...">`

Also adjust pricing ranges if you want:
- `assets/config.json`

## 2) Put your real photos
Easiest approach:
- Replace the portfolio cards with your images + job descriptions.

## 3) Deploy (free)
### Option A — Netlify (drag & drop)
1. Create a Netlify site
2. Drag this folder into Netlify
3. Add your domain (optional)

### Option B — GitHub Pages
1. Create a repo
2. Upload these files
3. Enable Pages (root)

### Option C — Any hosting
Upload all files to your public web folder.

## 4) Next upgrades (when you’re ready)
- Replace mailto forms with Netlify Forms / Formspree
- Add Google Reviews embed + map
- Add a “Call now” floating button
- Add more city pages (Calgary, Leduc, etc.)


## Service areas
Edmonton, Beaumont, St. Albert, Sherwood Park, Leduc, Spruce Grove, Calgary


## AI Design Studio (photo upload + AI redesign)
This site includes `design-studio.html` and a Netlify Function at `/api/redesign` (no extra dependencies).
To enable it:
1) Deploy the site to Netlify
2) Netlify > Site settings > Environment variables:
   - OPENAI_API_KEY = your OpenAI API key
3) Redeploy.
Notes: keep variations small (1–3) to control cost.

## Monetization
- Config: assets/studio-config.json
- Free variations: 1
- Paid: 2–3 (add your Stripe payment link)


## Vercel workaround (if Netlify env vars are locked)
If Netlify asks you to pay for Environment variables, host the AI endpoint on Vercel (free) and paste the endpoint URL in:
- assets/studio-config.json -> api_endpoint
Example endpoint:
https://YOUR-PROJECT.vercel.app/api/redesign
