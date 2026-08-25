# Toolbench

Ek simple, static tools-directory site. No build step, no framework — plain HTML/CSS/JS, GitHub Pages pe seedha deploy hota hai.

## Design

Workbench/pegboard theme banaya hai khaas isi site ke liye — dark graphite background pegboard-hole texture ke saath, brass/amber accent (toolbench hardware se inspired), category cards "drawers" ki tarah. Ye kisi existing theme se copy nahi kiya — from scratch banaya taaki generic AI-template na lage. `IBM Plex Mono` headings/tags ke liye (blueprint/label feel), `Inter` body text ke liye. Light mode bhi same tokens se derive hota hai (`style.css` ke top mein `:root` aur `[data-theme="light"]`).

Agar palette/font badalna ho, sirf `style.css` ke `:root` variables edit karo — poori site update ho jayegi.

## Structure

```
index.html              → homepage, search + all tools
category/
  category-template.html → TEMPLATE, n8n isse duplicate karta hai
  ai-tools.html           → generated example
  seo-tools.html          → generated example
  design-tools.html       → generated example
  automation-tools.html   → generated example
tools-data.json          → single source of truth — sabhi tools + categories
style.css                → shared theme
script.js                → search, filter, dark/light toggle
feed.xml                 → RSS
sitemap.xml              → sitemap
robots.txt
```

## Kaam kaise karta hai

- **Search**: client-side, `tools-data.json` load karke naam/description/tags match karta hai. No backend chahiye.
- **Categories**: homepage pe pills se in-place filter hota hai; category pages standalone URLs hain (SEO ke liye — Google har category ko alag index karega).
- **Naya tool add karna**: sirf `tools-data.json` mein ek object add karo — category pages automatically update ho jayenge kyunki wo bhi isi file se filter karte hain. Koi category page dobara generate nahi karni padti.
- **Nayi category add karna**: `tools-data.json` ke `categories` array mein entry daalo, phir `category-template.html` ko duplicate karke naye slug pe `[[CATEGORY_SLUG]]`, `[[CATEGORY_NAME]]`, `[[CATEGORY_DESCRIPTION]]` replace karo (same `[[BRACKETED]]` pattern jo Blogger pipeline mein use hota hai) — aur `sitemap.xml` mein ek `<url>` block add karo.
- **Dark/light toggle**: `localStorage` mein save hota hai, system preference fallback ke saath.

## n8n automation ke liye

Sab kuch GitHub Contents API se automate ho sakta hai, existing pattern jaisa hi:
1. Naya tool → `tools-data.json` PUT karo (existing JSON parse karke naya object append karo)
2. Naya category → `category-template.html` fetch karo, placeholders replace karo, `/category/[slug].html` pe PUT karo
3. `sitemap.xml` mein naye category ka `<url>` block append karo
4. `feed.xml` ke top pe naya `<item>` insert karo (RSS reader ke liye newest-first)

## Deploy

1. Ye sab files apne GitHub repo ke root mein daalo
2. Repo Settings → Pages → source: `main` branch, root
3. Custom domain (agar `tools.earthinsider.in` use kar rahe ho) — Settings → Pages → Custom domain, aur DNS mein CNAME record daalo
