const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public Blog Routes
router.get('/blogs', blogController.renderBlogList);
router.get('/blogs/:slug', blogController.renderBlogDetail);

module.exports = router;
