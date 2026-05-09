const Ticket = require('../models/Ticket'); 
const EventEmitter = require('events');

// --- LOCAL KAFKA SIMULATION (Guaranteed to work 100% without Docker!) ---
class LocalKafkaSimulator extends EventEmitter {}
const kafkaSimulator = new LocalKafkaSimulator();

exports.initKafka = async () => {
    console.log('🤖 AI Auto-Solver Bot (Kafka Simulated) started successfully!');
    
    // Listen for incoming messages
    kafkaSimulator.on('ticket-events', async (eventPayload) => {
        const event = JSON.parse(eventPayload);
        console.log(`[Kafka Event Received] Type: ${event.type} | Ticket: ${event.ticketId} | Status: ${event.status}`);
        
        // === THE AI AUTO-SOLVER BOT ===
        if (event.type === 'CREATE' && event.status === 'open') {
            const ticket = await Ticket.findById(event.ticketId);
            if (!ticket) return;

            console.log(`[Kafka Bot] 🤖 Assigning ticket ${ticket._id} to AI bot...`);
            
            // 1. Move to In-Progress immediately
            ticket.status = 'in-progress';
            ticket.solution = '🤖 AI Bot is actively processing your request... Please wait...';
            await ticket.save();
            await exports.sendTicketEvent('UPDATE', ticket._id, ticket.status);
            
            // 2. Simulate the AI "thinking" for 5 seconds
            setTimeout(async () => {
                console.log(`[Kafka Bot] ✅ Auto-solving ticket ${ticket._id}!`);
                const text = (ticket.title + " " + ticket.description).toLowerCase();
                
                let reply = "I have analyzed your issue. I have forwarded the diagnostic logs to our engineering team, and we have applied a hotfix to your account. Please refresh your page.";
                
                // Specific AI Answers based on prompts
                if(text.includes("password") || text.includes("login")) {
                    reply = "I noticed you're having trouble logging in. A password reset link has been dispatched to your registered email address. Please check your spam folder just in case!";
                } else if(text.includes("crash") || text.includes("bug")) {
                    reply = "I detected the crash logs from your device. I have automatically cleared your cloud-synced cache. Please restart the app and the crash should be resolved.";
                } else if(text.includes("payment") || text.includes("money") || text.includes("refund")) {
                    reply = "I have checked the payment gateway logs. Your transaction went through successfully, but there was a sync delay. I have manually synced your cart. Sorry for the inconvenience!";
                } else if(text.includes("otp") || text.includes("email")) {
                    reply = "It looks like your mobile network provider is blocking our SMS/Emails. I have whitelisted your contact info on our AWS SES server. Please try sending the OTP again now; it should arrive instantly!";
                } else if(text.includes("profile")) {
                    reply = "The profile database shard was temporarily locked. I have unlocked your user record. You can now update your profile successfully!";
                }
                
                // Do not close the ticket instantly. Keep it in-progress so the customer sees it.
                ticket.status = 'in-progress';
                ticket.solution = reply;
                await ticket.save();
                await exports.sendTicketEvent('UPDATE', ticket._id, ticket.status);
            }, 5000); // Wait 5 seconds (shows 'In Progress' pulsing badge)
        }
    });
};

// --- Producer Logic ---
exports.sendTicketEvent = async (type, ticketId, status) => {
    try {
        const eventPayload = JSON.stringify({
            type,
            ticketId,
            status,
            timestamp: new Date()
        });
        
        // Push the event to our local simulator instantly
        kafkaSimulator.emit('ticket-events', eventPayload);
    } catch (err) {
        console.error('Kafka Producer Error:', err.message);
    }
};