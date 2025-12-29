// Shared date/time formatting utilities

function getOrdinal(n: number): string {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

function monthName(date: Date): string {
    return date.toLocaleString("en-US", { month: "long" });
}

function monthShort(date: Date): string {
    return date.toLocaleString("en-US", { month: "short" });
}

function parseDate(dateStr: string): Date {
    // Ensure we only parse date portion if ISO string
    // Keep local timezone rendering consistent with existing UI
    return new Date(dateStr);
}

export function formatDateTimeRange(
    startDateStr: string,
    endDateStr: string | undefined,
    startTime: string,
    endTime: string
): string {
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr || startDateStr);
    const sameDay = startDate.toDateString() === endDate.toDateString();

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    const startPart = `${startDay}${getOrdinal(startDay)} ${monthName(startDate)} ${startTime}`;
    const endPart = `${endDay}${getOrdinal(endDay)} ${monthName(endDate)} ${endTime}`;

    // Always include both boundaries per requirement
    return `from ${startPart} to ${endPart}`;
}

// Short format for event cards: "18th Dec 12:00"
export function formatEventCardDateTime(dateStr: string, time: string): string {
    const date = parseDate(dateStr);
    const day = date.getDate();
    return `${day}${getOrdinal(day)} ${monthShort(date)} ${time}`;
}

// Format start datetime: "30th December 12:00"
export function formatStartDateTime(dateStr: string, time: string): string {
    const date = parseDate(dateStr);
    const day = date.getDate();
    return `${day}${getOrdinal(day)} ${monthName(date)} ${time}`;
}

// Format end datetime: "9th January 12:00"
export function formatEndDateTime(dateStr: string, time: string): string {
    const date = parseDate(dateStr);
    const day = date.getDate();
    return `${day}${getOrdinal(day)} ${monthName(date)} ${time}`;
}

export function formatHumanDate(dateStr: string): string {
    const d = parseDate(dateStr);
    const day = d.getDate();
    return `${day}${getOrdinal(day)} ${monthName(d)}`;
}
