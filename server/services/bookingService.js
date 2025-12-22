const Booking = require('../models/Booking');

const bookingService = {
    // Get all bookings
    async getAllBookings(query = {}) {
        const { page = 1, limit = 10, status } = query;
        const filter = {};
        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate('user', 'name email')
            .populate('venue', 'name address')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(filter);

        return {
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    },

    // Get user's bookings
    async getUserBookings(userId) {
        const bookings = await Booking.find({ user: userId })
            .populate('venue', 'name address images')
            .sort({ bookingDate: -1 });
        return bookings;
    },

    // Get venue's bookings
    async getVenueBookings(venueId) {
        const bookings = await Booking.find({ venue: venueId })
            .populate('user', 'name email phone')
            .sort({ bookingDate: -1 });
        return bookings;
    },

    // Get booking by ID
    async getBookingById(id) {
        const booking = await Booking.findById(id)
            .populate('user', 'name email phone')
            .populate('venue', 'name address images pricing');
        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    },

    // Create booking
    async createBooking(data) {
        const booking = await Booking.create(data);
        // TODO: Send notification to venue owner
        return booking;
    },

    // Update booking
    async updateBooking(id, updateData) {
        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );
        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    },

    // Update booking status (accept/reject)
    async updateBookingStatus(id, { status, rejectionReason, modifiedDates }) {
        const Venue = require('../models/Venue');

        const updateData = {
            status,
            'ownerResponse.respondedAt': new Date()
        };

        if (rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        if (modifiedDates) {
            updateData['ownerResponse.modifiedDates'] = modifiedDates;
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('venue');

        if (!booking) {
            throw new Error('Booking not found');
        }

        // If accepted, add to venue's blockedDates
        if (status === 'accepted' && booking.venue) {
            const bookingDateStr = new Date(booking.bookingDate).toISOString().split('T')[0];
            const venue = await Venue.findById(booking.venue._id || booking.venue);

            if (venue) {
                // Find existing date entry or create new one
                let dateEntry = venue.blockedDates?.find(d => d.date === bookingDateStr);

                if (dateEntry) {
                    // Add slot to existing date
                    dateEntry.slots.push({
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        type: 'booked'
                    });
                } else {
                    // Create new date entry
                    if (!venue.blockedDates) venue.blockedDates = [];
                    venue.blockedDates.push({
                        date: bookingDateStr,
                        slots: [{
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            type: 'booked'
                        }]
                    });
                }

                await venue.save();
            }
        }

        return booking;
    },

    // Cancel booking
    async cancelBooking(id, reason) {
        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: { status: 'cancelled', rejectionReason: reason } },
            { new: true }
        );

        if (!booking) {
            throw new Error('Booking not found');
        }

        // TODO: Process refund if already paid

        return booking;
    }
};

module.exports = bookingService;
