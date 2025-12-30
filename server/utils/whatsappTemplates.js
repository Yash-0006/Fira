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

// Simple one-parameter template; align name to approved template
function jaspers_market_plain_text_v1({ bodyText }) {
    return {
        name: 'jaspers_market_plain_text_v1',
        language: { code: 'en_US' },
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: bodyText || 'Hello from FIRA' }
                ]
            }
        ]
    };
}

module.exports = {
    bookingConfirmationTemplate,
    bookingStatusTemplate,
    eventReminderTemplate,
    jaspers_market_plain_text_v1
};
