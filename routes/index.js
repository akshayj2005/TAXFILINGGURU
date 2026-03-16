const express = require('express');
const router = express.Router();

const mainRoutes = require('./main');
const userRoutes = require('./user');
const toolRoutes = require('./tool');
const residentRoutes = require('./resident');
const nriRoutes = require('./nri');
const dashboardRoutes = require('./dashboard');
const blogRoutes = require('./blog');

// Mount Feature Routes
router.use('/', mainRoutes);
router.use('/', userRoutes);
router.use('/', toolRoutes);
router.use('/', residentRoutes);
router.use('/', nriRoutes);
router.use('/', dashboardRoutes);
router.use('/', blogRoutes);

module.exports = router;
