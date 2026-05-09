const Ticket = require('../models/Ticket');
const { sendTicketEvent } = require('../services/kafkaService'); // <-- NEW: Import the event sender

// --- Create Ticket Algorithm ---
exports.createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const ticket = new Ticket({
            title, 
            description, 
            createdBy: req.user.id 
        });
        
        await ticket.save();
        
        // <-- NEW: Send an event to Kafka that a ticket was just created
        await sendTicketEvent('CREATE', ticket._id, ticket.status);
        
        res.status(201).json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Get Tickets Algorithm ---
exports.getTickets = async (req, res) => {
    try {
        let tickets;
        
        if (req.user.role === 'customer') {
            tickets = await Ticket.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        } else {
            tickets = await Ticket.find().sort({ createdAt: -1 }); 
        }

        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'open').length;
        const inProgress = tickets.filter(t => t.status === 'in-progress').length;
        const closed = tickets.filter(t => t.status === 'closed').length;

        res.json({ stats: { total, open, inProgress, closed }, tickets });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Update Ticket Status Algorithm ---
exports.updateTicket = async (req, res) => {
    try {
        const { status } = req.body;
        
        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        ticket.status = status;
        await ticket.save();

        // <-- NEW: Send an event to Kafka that a ticket was just updated
        await sendTicketEvent('UPDATE', ticket._id, ticket.status);

        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Delete Ticket Algorithm ---
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        await ticket.deleteOne();
        res.json({ msg: 'Ticket deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};