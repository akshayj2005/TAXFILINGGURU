const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String, // HTML or Markdown content
        required: true
    },
    shortDescription: {
        type: String,
        trim: true
    },
    image: {
        type: String, // Image URL/Path
        default: '/images/blog-placeholder.jpg'
    },
    author: {
        type: String,
        default: 'TaxFilingGuru Team'
    },
    authorImage: {
        type: String, // Author profile image
        default: '/assets/images/TFG_LOGO.png'
    },
    authorRole: {
        type: String,
        default: 'Super Administrator'
    },
    authorBio: {
        type: String,
        default: 'Expert team at TaxFilingGuru dedicated to simplifying complex taxation laws and helping individuals and businesses optimize their financial performance.'
    },
    ctaText: {
        type: String,
        default: 'Read Full Article'
    },
    ctaLink: {
        type: String
    },
    ctaDescription: {
        type: String,
        default: 'Need expert tax filing help?'
    },
    category: {
        type: String,
        enum: ['Income Tax', 'GST', 'NRI Taxation', 'Investments', 'Business', 'Notice Handling', 'Others'],
        default: 'Others'
    },
    tags: [String],
    isPublished: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    seoTitle: String,
    seoDescription: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

blogSchema.pre('validate', async function(next) {
    if (this.title && !this.slug) {
        let baseSlug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!baseSlug) baseSlug = 'post';
        
        let slug = baseSlug;
        let counter = 1;
        // Using the models object to dynamically check for duplicates
        let existing = await mongoose.models.Blog.findOne({ slug });
        while (existing && existing._id.toString() !== this._id.toString()) {
            slug = `${baseSlug}-${counter}`;
            existing = await mongoose.models.Blog.findOne({ slug });
            counter++;
        }
        this.slug = slug;
    }
    next();
});

blogSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Blog', blogSchema);
