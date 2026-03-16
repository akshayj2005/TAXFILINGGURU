# 🚀 Master SEO & Schema Implementation Plan

This project uses a **Data-Driven SEO Architecture**. All metadata, social tags, and structured data (Schema) are managed from a central JSON configuration.

---

## 1. 🏗️ Central Configuration (`config/seo.json`)
The source of truth for all SEO data. Every route is mapped to its specific metadata.

### Data Structure:
*   **`title`**: SEO-optimized page title (50-60 chars).
*   **`description`**: Meta description (150-160 chars).
*   **`keywords`**: Comma-separated target keywords.
*   **`canonical`**: The "Master Copy" URL.
*   **`og` (Open Graph)**: For social media (Facebook/LinkedIn).
    *   `title`, `description`, `image`, `type`.
*   **`twitter`**: For X (Twitter Cards).
    *   `card`, `site`, `title`, `description`, `image`.
*   **`faqs`**: Array of `{ "question": "...", "answer": "..." }`.
*   **`schema`**: JSON-LD Structured Data for Google.
*   **`headings`**: Logical page structure:
    *   `h1`: The primary title of the page (Unique per page).
    *   `h2`: Sub-topics or sections.
    *   `h3`: Detailed section titles or FAQ questions.

---

## 2. ⚙️ Smart Middleware (`middleware/seoMiddleware.js`)
The "Engine" that automatically detects the route and injects the correct data.

### Logic:
1.  **Match Route:** Detects `req.path` (e.g., `/nri-status`).
2.  **Lookup:** Finds matching entry in `seo.json`.
3.  **Fallback:** Uses a "Default" profile if no match is found.
4.  **Auto-Schema:** If `faqs` are present, the middleware **automatically generates** the `FAQPage` JSON-LD schema for Google.
5.  **Injection:** Attaches the final `seo` object to `res.locals`, making it available in all EJS views.

---

## 3. 📝 View Implementation (`views/partials/header.ejs`)
The header is updated to dynamically render all SEO tags in the `<head>`.

### Injected Tags:
```html
<title><%= seo.title %></title>
<meta name="description" content="<%= seo.description %>">
<link rel="canonical" href="<%= seo.canonical %>">

<!-- Open Graph Tags -->
<meta property="og:title" content="<%= seo.og.title %>">
...

<!-- JSON-LD Schema -->
<script type="application/ld+json">
  <%- JSON.stringify(seo.schema) %>
</script>
```

---

## 4. 🧩 Reusable FAQ Component (`views/partials/faq.ejs`)
A clean UI component that renders FAQs visually for users using data from `seo.json`.

---

## 5. ✅ SEO Checklist for Updates
When adding a new page:
1.  Add the route to `config/seo.json`.
2.  Front-load keywords in the `title`.
3.  Include a call-to-action (CTA) in the `description`.
4.  Add 3-5 high-value FAQs to the `faqs` array to win Google's "Rich Snippets."
5. Ensure the `og:image` is a 1200x630px high-quality brand image.

---

## 🛠️ Advanced Technical SEO (Future Roadmap)

**NOTE: Items 1, 2, 4, and 5 are scheduled for Phase 2.**

1.  **Dynamic Sitemap.xml**: Auto-generated from `seo.json`. (Later)
2.  **Robots.txt**: Security-focused indexing control. (Later)
3.  **Breadcrumb Schema**: "Home > Tools > Status" paths in Google. (Implementing Now)
4.  **Review/Rating Schema**: For Star Ratings in Google search results. (Later)
5.  **Performance Optimization**: Gzip & Image Compression for Core Web Vitals. (Later)

