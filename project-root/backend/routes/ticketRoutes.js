const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// Notice how we put `authMiddleware` in the middle of these routes.
// This ensures that ONLY logged-in users with a valid token can access them.

// Route: POST /api/tickets
// Description: Create a new ticket
router.post('/', authMiddleware, ticketController.createTicket);

// Route: GET /api/tickets
// Description: Get tickets and dashboard stats
router.get('/', authMiddleware, ticketController.getTickets);

// Route: PUT /api/tickets/:id
// Description: Update a ticket's status
router.put('/:id', authMiddleware, ticketController.updateTicket);

// Route: DELETE /api/tickets/:id
// Description: Delete a ticket
router.delete('/:id', authMiddleware, ticketController.deleteTicket);

module.exports = router;