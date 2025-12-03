const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

// Public route
router.post('/', contactController.submitContact);

// Protected routes (admin only)
router.get('/', auth(['admin']), contactController.getAllContacts);
router.put('/:id', auth(['admin']), contactController.updateContactStatus);

module.exports = router;
