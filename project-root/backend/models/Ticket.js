const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
    solution: { type: String }, // <-- NEW: Added field for the bot or agent to leave a reply
    // createdBy and assignedTo link this ticket directly to specific Users
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' dates

module.exports = mongoose.model('Ticket', TicketSchema);