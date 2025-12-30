// Meta WhatsApp template payload helpers
// Each helper returns the components section for a template message request

function bookingConfirmationTemplate({ userName, venueName, date, startTime, endTime, bookingId }) {
    return {
        name: 'booking_confirmation',
        language: { code: 'en' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: userName || 'there' },
                    { type: 'text', text: venueName || 'your venue' },
                    { type: 'text', text: date || 'date pending' },
                    { type: 'text', text: `${startTime || 'start'} - ${endTime || 'end'}` },
                    { type: 'text', text: bookingId || 'N/A' }
                ]
            }
        ]
    };
}

function bookingStatusTemplate({ userName, venueName, status, bookingId, note }) {
    return {
        name: 'booking_status_update',
        language: { code: 'en' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: userName || 'there' },
                    { type: 'text', text: venueName || 'your venue' },
                    { type: 'text', text: status || 'pending' },
                    { type: 'text', text: bookingId || 'N/A' },
                    { type: 'text', text: note || '—' }
                ]
            }
        ]
    };
}

function eventReminderTemplate({ userName, eventName, startDateTime, venueName }) {
    return {
        name: 'event_reminder',
        language: { code: 'en' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: userName || 'there' },
                    { type: 'text', text: eventName || 'your event' },
                    { type: 'text', text: startDateTime || 'soon' },
                    { type: 'text', text: venueName || 'the venue' }
                ]
            }
        ]
    };
}

module.exports = {
    bookingConfirmationTemplate,
    bookingStatusTemplate,
    eventReminderTemplate
};
