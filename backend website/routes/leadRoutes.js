const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middleware/auth');

// Public route (for website form submissions)
router.post('/', leadController.createLead);

// Protected routes
router.get('/', auth(['admin', 'agent']), leadController.getAllLeads);
router.get('/stats', auth(['admin', 'agent']), leadController.getLeadStats);
router.get('/:id', auth(['admin', 'agent']), leadController.getLeadById);
router.put('/:id', auth(['admin', 'agent']), leadController.updateLead);
router.post('/:id/notes', auth(['admin', 'agent']), leadController.addNote);

module.exports = router;
