const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes (admin/agent only)
router.post('/', auth(['admin', 'agent']), propertyController.uploadImages, propertyController.createProperty);
router.put('/:id', auth(['admin', 'agent']), propertyController.updateProperty);
router.delete('/:id', auth(['admin']), propertyController.deleteProperty);

module.exports = router;
