const seoConfig = require('../config/seo.json');

const seoMiddleware = (req, res, next) => {
    // console.log('[SEO DEBUG] Current Config Keys:', Object.keys(seoConfig));
    // Normalize path: Remove query params and trailing slashes
    let path = req.path.split('?')[0];
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    // Get page config or fallback to parent path, then to default
    let pageSeo = seoConfig[path];

    // Support hierarchical fallback (e.g. /resident/salary-essential -> /resident)
    if (!pageSeo && path.includes('/', 1)) {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        pageSeo = seoConfig[parentPath] || {};
    } else {
        pageSeo = pageSeo || {};
    }

    const defaultSeo = seoConfig['default'];

    // Merge data: Page > Default
    const title = pageSeo.title || defaultSeo.title;
    const description = pageSeo.description || defaultSeo.description;
    const keywords = pageSeo.keywords || defaultSeo.keywords;
    const image = pageSeo.image || defaultSeo.image;
    const imageAlt = pageSeo.imageAlt || defaultSeo.imageAlt || title;
    const type = pageSeo.type || defaultSeo.type;
    const canonical = pageSeo.canonical || `${defaultSeo.canonical}${req.path}`;
    const headings = pageSeo.headings || defaultSeo.headings;

    // Debug log
    console.log(`[SEO DEBUG] Path: "${path}" | Matched: ${pageSeo.title ? 'YES' : 'NO'} | Title: ${title}`);

    // Auto-Generate FAQ Schema if FAQs exist
    let schema = [];
    if (pageSeo.faqs && pageSeo.faqs.length > 0) {
        schema.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": pageSeo.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        });
    }

    // Add Breadcrumb Schema
    let breadcrumbElements = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": defaultSeo.canonical
        }
    ];

    // If it's a tool page, add "Tools" as parent
    const toolPaths = ['/refund-maximizer', '/regime-comparison', '/nri-status', '/trader-turnover', '/refund-status'];
    if (toolPaths.includes(path)) {
        breadcrumbElements.push({
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": `${defaultSeo.canonical}/tools`
        });
        breadcrumbElements.push({
            "@type": "ListItem",
            "position": 3,
            "name": title,
            "item": canonical
        });
    } else if (path !== '/') {
        breadcrumbElements.push({
            "@type": "ListItem",
            "position": 2,
            "name": title,
            "item": canonical
        });
    }

    schema.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbElements
    });

    // Final SEO Object for Views
    res.locals.seo = {
        title,
        description,
        keywords,
        canonical,
        headings,
        og: {
            title,
            description,
            image,
            imageAlt,
            url: canonical,
            type
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            image,
            imageAlt
        },
        schema, // Array of JSON-LD objects
        faqs: pageSeo.faqs || [] // For UI rendering
    };

    next();
};

module.exports = seoMiddleware;
