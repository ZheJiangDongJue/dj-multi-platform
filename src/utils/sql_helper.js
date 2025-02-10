export default function arrayToSqlInString(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
        return "''"; // Return empty string if array is invalid or empty to avoid SQL errors
    }

    // 1. Handle different data types and escape single quotes:
    const escapedValues = arr.map(value => {
        if (typeof value === 'string') {
            // Escape single quotes within strings
            return `'${value.replace(/'/g, "''")}'`;
        } else if (typeof value === 'number') {
            return value;
        } else if (value === null || value === undefined) {
            return 'NULL'; // Handle null/undefined values appropriately for your database
        } else if (typeof value === 'boolean') {
            return value ? '1' : '0'; // Or 'TRUE'/'FALSE' depending on your database
        } else if (value instanceof Date) {
            // Format date to a SQL-compatible string (e.g., ISO 8601)
            return `'${value.toISOString()}'`;
        } else {
            // For other types, convert to string and escape quotes or handle as needed
            return `'${String(value).replace(/'/g, "''")}'`;
        }
    });

    // 2. Join the escaped values with commas:
    return escapedValues.join(',');
}