const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

const ticketService = {
    // Get all tickets
    async getAllTickets(query = {}) {
        const { page = 1, limit = 10, status } = query;
        const filter = {};
        if (status) filter.status = status;

        const tickets = await Ticket.find(filter)
            .populate('user', 'name email')
            .populate('event', 'name date venue')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Ticket.countDocuments(filter);

        return {
            tickets,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    },

    // Get user's tickets
    async getUserTickets(userId) {
        const tickets = await Ticket.find({ user: userId })
            .populate({
                path: 'event',
                select: 'name date startTime venue',
                populate: { path: 'venue', select: 'name address' }
            })
            .sort({ createdAt: -1 });
        return tickets;
    },

    // Get event's tickets
    async getEventTickets(eventId) {
        const tickets = await Ticket.find({ event: eventId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return tickets;
    },

    // Get ticket by ID
    async getTicketById(id) {
        const ticket = await Ticket.findById(id)
            .populate('user', 'name email')
            .populate({
                path: 'event',
                populate: { path: 'venue', select: 'name address' }
            });
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return ticket;
    },

    // Purchase ticket
    async purchaseTicket({ userId, eventId, quantity = 1, ticketType = 'general' }) {
        const crypto = require('crypto');

        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        if (event.currentAttendees + quantity > event.maxAttendees) {
            throw new Error('Not enough tickets available');
        }

        // Generate ticket ID and QR code
        const ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
        const qrCode = Buffer.from(JSON.stringify({
            ticketId,
            eventId,
            userId
        })).toString('base64');

        // Create ticket
        const ticket = await Ticket.create({
            user: userId,
            event: eventId,
            ticketId,
            qrCode,
            ticketType,
            quantity,
            price: event.ticketPrice * quantity
        });

        // Update event attendee count
        await Event.findByIdAndUpdate(eventId, {
            $inc: { currentAttendees: quantity }
        });

        // TODO: Initiate payment if paid event

        return ticket;
    },

    // Validate ticket (check-in)
    async validateTicket(ticketId, qrCode) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        if (ticket.isUsed) {
            throw new Error('Ticket already used');
        }

        if (ticket.qrCode !== qrCode) {
            throw new Error('Invalid QR code');
        }

        // Mark as used
        ticket.isUsed = true;
        ticket.usedAt = new Date();
        ticket.status = 'used';
        await ticket.save();

        return { message: 'Ticket validated successfully', ticket };
    },

    // Cancel ticket
    async cancelTicket(ticketId) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        if (ticket.isUsed) {
            throw new Error('Cannot cancel used ticket');
        }

        ticket.status = 'cancelled';
        await ticket.save();

        // Decrease attendee count
        await Event.findByIdAndUpdate(ticket.event, {
            $inc: { currentAttendees: -ticket.quantity }
        });

        // TODO: Process refund

        return ticket;
    }
};

module.exports = ticketService;
