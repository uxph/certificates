function generateEventCode(eventId, lastName) {
    // Ensure we always have at least 3 characters
    const evPart = (eventId || "EVT").substring(0, 3).toUpperCase();
    const lnPart = (lastName || "XXX").substring(0, 3).toUpperCase().padEnd(3, "X");

    // Generate numeric sections
    //    const num1 = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const num2 = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const num3 = String(Math.floor(Math.random() * 100_000)).padStart(5, "0");

    // Final code
    return `HLX-${evPart}${lnPart}-${num2}-${num3}`;
}

export default generateEventCode;
