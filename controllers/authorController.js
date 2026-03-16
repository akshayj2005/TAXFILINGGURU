const Author = require('../models/Author');
const fs = require('fs');
const path = require('path');

exports.adminGetAuthors = async (req, res) => {
    try {
        // Ensure the Super Admin profile always exists
        const superAdminExists = await Author.findOne({ name: 'TaxFilingGuru' });
        
        if (!superAdminExists) {
            const defaultAdmin = new Author({
                name: 'TaxFilingGuru',
                role: 'The Super Admin',
                bio: 'Official administrative profile of TaxFilingGuru. Managing complex taxation solutions and providing expert financial guidance.',
                image: '/assets/images/TFG_LOGO.png'
            });
            await defaultAdmin.save();
        }

        const authors = await Author.find().sort({ createdAt: -1 });

        res.render('admin/authors', { 
            authors, 
            currentPage: 'authors', 
            layout: false 
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.adminAddAuthor = async (req, res) => {
    try {
        const { name, role, bio, linkedin, twitter, website } = req.body;
        
        let imageUrl = '/assets/images/TFG_LOGO.png';
        if (req.file) {
            imageUrl = `/uploads/profiles/${req.file.filename}`;
        }

        const author = new Author({
            name,
            role,
            bio,
            image: imageUrl,
            socialLinks: { linkedin, twitter, website }
        });

        await author.save();
        res.json({ success: true, message: 'Author added successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.adminUpdateAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, bio, linkedin, twitter, website, isActive } = req.body;
        
        const author = await Author.findById(id);
        if (!author) return res.status(404).json({ success: false, error: 'Author not found' });

        author.name = name || author.name;
        author.role = role || author.role;
        author.bio = bio || author.bio;
        author.socialLinks = {
            linkedin: linkedin !== undefined ? linkedin : author.socialLinks.linkedin,
            twitter: twitter !== undefined ? twitter : author.socialLinks.twitter,
            website: website !== undefined ? website : author.socialLinks.website
        };
        author.isActive = isActive !== undefined ? (isActive === 'true') : author.isActive;

        if (req.file) {
            if (author.image && author.image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '../public', author.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            author.image = `/uploads/profiles/${req.file.filename}`;
        }

        await author.save();
        res.json({ success: true, message: 'Author updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.adminDeleteAuthor = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (author && (author.name === 'TaxFilingGuru' || author.role === 'The Super Admin')) {
            return res.status(400).json({ success: false, error: 'Cannot delete the Super Admin profile. It is permanent.' });
        }
        if (author && author.image && author.image.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '../public', author.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        await Author.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Author deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
