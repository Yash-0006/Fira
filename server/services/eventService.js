const Event = require('../models/Event');
const PrivateEventAccess = require('../models/PrivateEventAccess');

const eventService = {
    // Get all events
    async getAllEvents(query = {}) {
        const { page = 1, limit = 10, eventType, status, category, organizer, sort, search } = query;
        const filter = {};
        if (eventType) filter.eventType = eventType;
        if (category && category !== 'All') filter.category = category;

        // If querying by organizer (dashboard), show all their events
        // Otherwise, only show approved/upcoming and active events (public listing)
        if (organizer) {
            filter.organizer = organizer;
            if (status) filter.status = status;
        } else {
            // Public listing - show only fully approved events that are in the future
            filter.status = 'approved';
            filter.isActive = { $ne: false };
            filter.date = { $gte: new Date() }; // Only future events
        }

        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        // Sorting options
        let sortOption = { date: 1 }; // default: upcoming (earliest first)
        if (sort === 'upcoming') sortOption = { date: 1 };
        else if (sort === 'top') sortOption = { 'stats.attendees': -1, 'stats.interested': -1 };
        else if (sort === 'latest') sortOption = { createdAt: -1 };

        const events = await Event.find(filter)
            .populate('organizer', 'name email verificationBadge')
            .populate('venue', 'name address images')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort(sortOption);

        const total = await Event.countDocuments(filter);

        return {
            events,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        };
    },

    // Get upcoming events (public, approved/upcoming)
    async getUpcomingEvents(query = {}) {
        const { limit = 10, category } = query;
        const filter = {
            date: { $gte: new Date() },
            status: 'approved', // Only show fully approved events
            eventType: 'public',
            isActive: { $ne: false }
        };
        if (category) filter.category = category;

        const events = await Event.find(filter)
            .populate('organizer', 'name verificationBadge')
            .populate('venue', 'name address')
            .limit(limit * 1)
            .sort({ date: 1 });

        return events;
    },

    // Get event by ID
    async getEventById(id) {
        const event = await Event.findById(id)
            .populate('organizer', 'name email avatar verificationBadge')
            .populate('venue', 'name description address images capacity');
        if (!event) {
            throw new Error('Event not found');
        }
        return event;
    },

    // Create event
    async createEvent(data) {
        // Check for time slot conflicts at the venue
        const { venue, date, endDate, startTime, endTime } = data;

        // Validate date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            throw new Error('Event date cannot be in the past');
        }

        // Validate end date if provided
        if (endDate && new Date(endDate) < new Date(date)) {
            throw new Error('End date must be after start date');
        }

        if (venue && date && startTime && endTime) {
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);

            // Find events at the same venue on the same date that are not cancelled/rejected
            const conflictingEvents = await Event.find({
                venue: venue,
                date: {
                    $gte: checkDate,
                    $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
                },
                status: { $nin: ['cancelled', 'rejected'] }
            });

            // Check for time overlap
            for (const existingEvent of conflictingEvents) {
                const existingStart = existingEvent.startTime;
                const existingEnd = existingEvent.endTime;

                // Check if times overlap
                // Time format is "HH:MM" string
                const newStartMins = this.timeToMinutes(startTime);
                const newEndMins = this.timeToMinutes(endTime);
                const existingStartMins = this.timeToMinutes(existingStart);
                const existingEndMins = this.timeToMinutes(existingEnd);

                // Overlap occurs if: newStart < existingEnd AND newEnd > existingStart
                if (newStartMins < existingEndMins && newEndMins > existingStartMins) {
                    throw new Error(`Time slot conflict: This venue is already booked from ${existingStart} to ${existingEnd} for "${existingEvent.name}"`);
                }
            }
        }

        const event = await Event.create(data);
        return event;
    },

    // Helper to convert time string to minutes
    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + (minutes || 0);
    },

    // Update event
    async updateEvent(id, updateData) {
        const event = await Event.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );
        if (!event) {
            throw new Error('Event not found');
        }
        return event;
    },

    // Delete event
    async deleteEvent(id) {
        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            throw new Error('Event not found');
        }
        return { message: 'Event deleted successfully' };
    },

    // Cancel event
    async cancelEvent(id, reason) {
        const Ticket = require('../models/Ticket');
        const Notification = require('../models/Notification');
        const paymentService = require('./paymentService');

        const event = await Event.findById(id);
        if (!event) {
            throw new Error('Event not found');
        }

        if (event.status === 'cancelled') {
            throw new Error('Event is already cancelled');
        }

        // Find all active tickets for this event
        const activeTickets = await Ticket.find({
            event: id,
            status: 'active'
        }).populate('user', 'name email');

        let refundResults = {
            totalTickets: activeTickets.length,
            refundsInitiated: 0,
            refundsFailed: 0,
            totalRefundAmount: 0
        };

        // Process each ticket
        for (const ticket of activeTickets) {
            try {
                // Cancel the ticket
                ticket.status = 'cancelled';
                ticket.cancelledAt = new Date();
                ticket.cancellationReason = reason || 'Event cancelled by organizer';
                await ticket.save();

                // If ticket was paid, initiate refund using existing paymentService method
                if (ticket.payment) {
                    try {
                        const refund = await paymentService.requestRefund(ticket.payment, {
                            reason: 'event_cancelled',
                            reasonDetails: reason || 'Event was cancelled by the organizer'
                        });
                        refundResults.refundsInitiated++;
                        refundResults.totalRefundAmount += refund.amount;
                    } catch (refundError) {
                        console.error(`Refund failed for ticket ${ticket._id}:`, refundError.message);
                        refundResults.refundsFailed++;
                    }
                }

                // Create notification for the user
                await Notification.create({
                    user: ticket.user._id,
                    title: 'Event Cancelled',
                    message: `The event "${event.name}" has been cancelled. ${ticket.price > 0 ? 'A refund has been initiated for your ticket.' : ''}`,
                    category: 'event_cancelled',
                    data: {
                        eventId: event._id,
                        ticketId: ticket._id,
                        refundAmount: ticket.price
                    }
                });

            } catch (err) {
                console.error(`Failed to process ticket ${ticket._id}:`, err);
                refundResults.refundsFailed++;
            }
        }

        // Update event status
        event.status = 'cancelled';
        event.cancelledAt = new Date();
        event.cancellationReason = reason;
        event.currentAttendees = 0;
        await event.save();

        return {
            event,
            refundResults
        };
    },

    // Request private event access
    async requestPrivateAccess(eventId, { userId, accessCode, message }) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        if (event.eventType !== 'private') {
            throw new Error('This is not a private event');
        }
        if (event.privateCode !== accessCode) {
            throw new Error('Invalid access code');
        }

        const request = await PrivateEventAccess.create({
            user: userId,
            event: eventId,
            accessCode,
            requestMessage: message
        });

        return request;
    },

    // Get events by organizer (User ID)
    async getEventsByOrganizer(userId, limit = 10) {
        const events = await Event.find({ organizer: userId, status: { $ne: 'cancelled' } })
            .populate('venue', 'name address images')
            .sort({ date: 1 }) // Upcoming first
            .limit(parseInt(limit));
        return events;
    },

    // Handle access request
    async handleAccessRequest(requestId, status) {
        const request = await PrivateEventAccess.findByIdAndUpdate(
            requestId,
            {
                $set: {
                    status,
                    respondedAt: new Date()
                }
            },
            { new: true }
        );
        if (!request) {
            throw new Error('Access request not found');
        }
        return request;
    },

    // Venue owner approves/rejects event
    async venueApproveEvent(eventId, venueOwnerId, { status, rejectionReason }) {
        const Venue = require('../models/Venue');
        const Notification = require('../models/Notification');

        const event = await Event.findById(eventId).populate('venue');
        if (!event) {
            throw new Error('Event not found');
        }

        // Verify venue ownership
        if (event.venue.owner.toString() !== venueOwnerId) {
            throw new Error('You do not own this venue');
        }

        event.venueApproval = {
            status,
            respondedAt: new Date(),
            respondedBy: venueOwnerId,
            rejectionReason: status === 'rejected' ? rejectionReason : undefined
        };

        // If venue rejected, update event status
        if (status === 'rejected') {
            event.status = 'rejected';
        }
        // If both approved, set to approved
        else if (status === 'approved' && event.adminApproval?.status === 'approved') {
            event.status = 'approved';
        }

        await event.save();

        // Notify organizer
        await Notification.create({
            user: event.organizer,
            title: status === 'approved' ? 'Venue Approved Your Event' : 'Venue Rejected Your Event',
            message: status === 'approved'
                ? `The venue has approved your event "${event.name}". Waiting for admin approval.`
                : `The venue has rejected your event "${event.name}". Reason: ${rejectionReason || 'Not specified'}`,
            type: 'system',
            data: { referenceId: event._id, referenceModel: 'Event' }
        });

        return event;
    },

    // Admin approves/rejects event
    async adminApproveEvent(eventId, adminId, { status, rejectionReason }) {
        const Notification = require('../models/Notification');

        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        event.adminApproval = {
            status,
            respondedAt: new Date(),
            respondedBy: adminId,
            rejectionReason: status === 'rejected' ? rejectionReason : undefined
        };

        // If admin rejected, update event status
        if (status === 'rejected') {
            event.status = 'rejected';
        }
        // If admin approved, set to approved (backward compat: if venueApproval not set, consider it approved)
        else if (status === 'approved') {
            const venueApproved = !event.venueApproval || event.venueApproval.status === 'approved' || !event.venueApproval.status;
            if (venueApproved) {
                event.status = 'approved';
            }
        }

        await event.save();

        // Notify organizer
        await Notification.create({
            user: event.organizer,
            title: status === 'approved' ? 'Event Approved by Admin' : 'Event Rejected by Admin',
            message: status === 'approved'
                ? `Your event "${event.name}" has been approved and is now live!`
                : `Your event "${event.name}" was rejected by admin. Reason: ${rejectionReason || 'Not specified'}`,
            type: 'system',
            data: { referenceId: event._id, referenceModel: 'Event' }
        });

        return event;
    },

    // Get events pending venue approval (for venue owners)
    async getVenueEventRequests(venueOwnerId, query = {}) {
        const Venue = require('../models/Venue');
        const { page = 1, limit = 10, status = 'pending' } = query;

        // Get venues owned by this user
        const venues = await Venue.find({ owner: venueOwnerId }).select('_id');
        const venueIds = venues.map(v => v._id);

        const filter = {
            venue: { $in: venueIds },
            'venueApproval.status': status
        };

        const events = await Event.find(filter)
            .populate('organizer', 'name email avatar verificationBadge')
            .populate('venue', 'name address images')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Event.countDocuments(filter);

        return {
            events,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        };
    },

    // Get events pending admin approval
    async getPendingAdminApproval(query = {}) {
        const { page = 1, limit = 10, status = 'pending' } = query;

        // Show all events that need admin review
        // Events are pending if they're not already approved/cancelled/rejected
        const filter = {
            status: { $nin: ['approved', 'cancelled', 'rejected', 'blocked'] },
            $or: [
                { 'adminApproval.status': { $ne: 'approved' } },
                { 'adminApproval.status': { $exists: false } },
                { adminApproval: { $exists: false } }
            ]
        };

        const events = await Event.find(filter)
            .populate('organizer', 'name email avatar verificationBadge')
            .populate('venue', 'name address images owner')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Event.countDocuments(filter);

        return {
            events,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        };
    }
};

module.exports = eventService;
