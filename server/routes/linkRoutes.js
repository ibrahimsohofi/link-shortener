const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const auth = require('../middleware/auth');

// Public routes
router.get('/:shortCode', linkController.redirectToOriginalUrl);

// Protected routes (require authentication)
router.post('/', auth, linkController.createLink);
router.get('/', auth, linkController.getLinks);
router.get('/detail/:id', auth, linkController.getLinkById);
router.delete('/:id', auth, linkController.deleteLink);
router.get('/analytics/:id', auth, linkController.getLinkAnalytics);

module.exports = router;
