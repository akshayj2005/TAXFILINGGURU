const Testimonial = require('../models/Testimonial');
const { withLogging } = require('../utils/wrapper');
const wrap = (name, handler) => withLogging('admin-testimonial', name, handler);

exports.adminGetTestimonials = wrap('adminGetTestimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        const stats = {
            total: testimonials.length,
            approved: testimonials.filter(t => t.isApproved).length,
            pending: testimonials.filter(t => !t.isApproved).length,
            fiveStar: testimonials.filter(t => t.rating === 5).length,
            avgRating: testimonials.length ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1) : '0.0'
        };

        res.render('admin/testimonials', {
            testimonials,
            stats,
            currentPage: 'testimonials',
            adminUser: req.session.adminUser,
            layout: false
        });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

exports.adminApproveTestimonial = wrap('adminApproveTestimonial', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // true or false
        await Testimonial.findByIdAndUpdate(id, { isApproved: status });
        res.json({ success: true, message: `Testimonial ${status ? 'approved' : 'hidden'} successfully` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

exports.adminApproveAllPending = wrap('adminApproveAllPending', async (req, res) => {
    try {
        const result = await Testimonial.updateMany({ isApproved: false }, { isApproved: true });
        res.json({ success: true, message: `Approved ${result.modifiedCount} pending testimonials.` });
    } catch (err) {
        console.error('Approve All Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

exports.adminDeleteTestimonial = wrap('adminDeleteTestimonial', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Admin] Deleting testimonial: ${id}`);
        await Testimonial.findByIdAndDelete(id);
        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (err) {
        console.error(`[Admin] Delete Error for ${req.params.id}:`, err);
        res.status(500).json({ success: false, error: err.message });
    }
});
