const Blog = require('../models/Blog');
const { withLogging } = require('../utils/wrapper');
const logger = require('../utils/logger')('blog');
const wrap = (name, handler) => withLogging('blog', name, handler);
const fs = require('fs');
const path = require('path');

// --- Public Routes ---

exports.renderBlogList = wrap('renderBlogList', async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
        res.render('blogs/index', { 
            blogs, 
            title: 'Insights & Tax Updates | TaxFilingGuru',
            seo: {
                title: 'Professional Tax Insights & Financial Updates',
                description: 'Stay updated with the latest in Income Tax, GST, NRI Taxation, and Financial Planning from our experts.'
            }
        });
    } catch (err) {
        logger.error('Blog List Error', err);
        res.status(500).send('Server Error');
    }
});

exports.renderBlogDetail = wrap('renderBlogDetail', async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog.findOne({ slug, isPublished: true });
        
        if (!blog) {
            return res.status(404).render('pages/404', { title: 'Blog Not Found' });
        }

        // Increment view count
        blog.viewCount += 1;
        await blog.save();

        const recentBlogs = await Blog.find({ 
            isPublished: true, 
            _id: { $ne: blog._id } 
        }).sort({ createdAt: -1 }).limit(3);

        const seoTitle = blog.seoTitle || blog.title;
        const seoDesc = blog.seoDescription || blog.shortDescription;
        const host = req.protocol + '://' + req.get('host');
        // Make the image globally visible to other devices correctly
        const seoImage = blog.image ? (blog.image.startsWith('http') ? blog.image : host + blog.image) : host + '/assets/images/TFG_LOGO.png';

        // Merge with global SEO instead of overwriting, ensuring global OG tags persist
        const mergedSeo = {
            ...res.locals.seo,
            title: seoTitle,
            description: seoDesc,
            og: {
                ...(res.locals.seo?.og || {}),
                title: seoTitle,
                description: seoDesc,
                image: seoImage,
                url: host + req.originalUrl
            },
            twitter: {
                ...(res.locals.seo?.twitter || {}),
                title: seoTitle,
                description: seoDesc,
                image: seoImage
            }
        };

        res.render('blogs/detail', { 
            blog, 
            recentBlogs,
            title: seoTitle,
            seo: mergedSeo
        });
    } catch (err) {
        logger.error('Blog Detail Error', err);
        res.status(500).send('Server Error');
    }
});

// --- Admin Routes ---

exports.adminGetBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        const Author = require('../models/Author');
        const authors = await Author.find({ isActive: true });
        res.render('admin/blogs', { 
            blogs, 
            authors,
            currentPage: 'blogs', 
            layout: false 
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.adminAddBlog = async (req, res) => {
    try {
        const { 
            title, content, shortDescription, category, author, authorRole, authorBio, authorImage,
            tags, isPublished, seoTitle, seoDescription, ctaText, ctaLink, ctaDescription 
        } = req.body;

        
        let imageUrl = '/assets/images/TFG_LOGO.png';
        if (req.file) {
            imageUrl = `/uploads/blogs/${req.file.filename}`;
        }

        const blog = new Blog({
            title,
            content,
            shortDescription,
            category,
            author: author || 'TaxFilingGuru Team',
            authorRole: authorRole || 'Super Administrator',
            authorBio: authorBio || 'Expert team at TaxFilingGuru dedicated to simplifying complex taxation laws and helping individuals and businesses optimize their financial performance.',
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            isPublished: isPublished === 'true' || isPublished === true,
            image: imageUrl,
            seoTitle,
            seoDescription,
            authorImage: authorImage || '/assets/images/TFG_LOGO.png',
            ctaText: ctaText || 'Read Full Article',
            ctaLink,
            ctaDescription: ctaDescription || 'Need expert tax filing help?'
        });

        await blog.save();
        res.json({ success: true, message: 'Blog post created successfully' });
    } catch (err) {
        console.error('Admin Add Blog Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.adminUpdateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, content, shortDescription, category, author, authorRole, authorBio, authorImage,
            tags, isPublished, seoTitle, seoDescription, ctaText, ctaLink, ctaDescription 
        } = req.body;

        
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.shortDescription = shortDescription || blog.shortDescription;
        blog.category = category || blog.category;
        blog.author = author || blog.author;
        blog.authorRole = authorRole || blog.authorRole;
        blog.authorBio = authorBio || blog.authorBio;
        blog.authorImage = authorImage || blog.authorImage;
        blog.tags = tags ? tags.split(',').map(t => t.trim()) : blog.tags;
        blog.isPublished = isPublished === 'true' || isPublished === true;
        blog.seoTitle = seoTitle || blog.seoTitle;
        blog.seoDescription = seoDescription || blog.seoDescription;
        blog.ctaText = ctaText || blog.ctaText;
        blog.ctaLink = ctaLink || blog.ctaLink;
        blog.ctaDescription = ctaDescription || blog.ctaDescription;

        if (req.file) {
            if (blog.image && blog.image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '../public', blog.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            blog.image = `/uploads/blogs/${req.file.filename}`;
        }

        await blog.save();
        res.json({ success: true, message: 'Blog post updated successfully' });
    } catch (err) {
        console.error('Admin Update Blog Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.adminDeleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });

        if (blog.image && blog.image.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '../public', blog.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Blog post deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
