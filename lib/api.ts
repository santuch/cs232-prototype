// API functions for fetching missing persons data

export interface MissingPerson {
    case_id: number;
    platform: string;
    picture: string;
    url: string;
    description: string;
    created_at: string;
    id: number;
    name: string;
    alternativeUrls?: string[];
}

export async function getMissingPersons(): Promise<MissingPerson[]> {
    try {
        const response = await fetch(
            "https://hofn6opl8l.execute-api.us-east-1.amazonaws.com/default/get_missingDatabase",
            { cache: "no-store" } // Don't cache the response
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching missing persons:", error);
        return [];
    }
}

// Helper function to extract age from description
export function extractAge(description: string | null): number | null {
    if (!description) return null;

    // Try to extract current age first
    const currentAgeMatch = description.match(/อายุปัจจุบัน: (\d+) ปี/);
    if (currentAgeMatch && currentAgeMatch[1]) {
        return parseInt(currentAgeMatch[1], 10);
    }

    // Fallback to age at the time of disappearance
    const ageMatch = description.match(/อายุขณะหายตัว: (\d+) ปี/);
    if (ageMatch && ageMatch[1]) {
        return parseInt(ageMatch[1], 10);
    }

    return null;
}

// Helper function to extract location from description
export function extractLocation(description: string | null): string {
    if (!description) return "ไม่ระบุ";

    const match = description.match(/สถานที่หายตัว: ([^\n]+)/);
    if (match && match[1]) {
        return match[1].trim();
    }

    return "ไม่ระบุ";
}

// Helper function to extract last seen date from description
export function extractLastSeen(description: string | null): string {
    if (!description) return "ไม่ระบุ";
    // Look for "วันที่หายตัว: YYYY-MM-DD" pattern
    const match = description.match(/วันที่หายตัว: ([^\n]+)/);
    if (match && match[1]) {
        // Convert YYYY-MM-DD to Thai date format
        try {
            const dateParts = match[1].split("-");
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10);
                const day = parseInt(dateParts[2], 10);

                // Thai month names
                const thaiMonths = [
                    "มกราคม",
                    "กุมภาพันธ์",
                    "มีนาคม",
                    "เมษายน",
                    "พฤษภาคม",
                    "มิถุนายน",
                    "กรกฎาคม",
                    "สิงหาคม",
                    "กันยายน",
                    "ตุลาคม",
                    "พฤศจิกายน",
                    "ธันวาคม",
                ];

                return `${day} ${thaiMonths[month - 1]} ${year + 543}`; // Convert to Buddhist Era
            }
        } catch {
            // If conversion fails, return the original date
        }
        return match[1];
    }
    return "ไม่ระบุ";
}

// Filter missing persons by search term
export function filterMissingPersons(
    persons: MissingPerson[],
    searchTerm: string
): MissingPerson[] {
    if (!searchTerm) return persons;

    const term = searchTerm.toLowerCase();
    return persons.filter((person) => {
        return (
            (person.name && person.name.toLowerCase().includes(term)) ||
            (person.description &&
                person.description.toLowerCase().includes(term)) ||
            extractLocation(person.description).toLowerCase().includes(term)
        );
    });
}

// Get recent missing persons (from the current year)
export function getRecentMissingPersons(
    persons: MissingPerson[]
): MissingPerson[] {
    if (!persons || !Array.isArray(persons)) return [];

    const currentYear = new Date().getFullYear().toString();
    return persons.filter(
        (person) =>
            person &&
            person.description &&
            person.description.includes(`วันที่หายตัว: ${currentYear}`)
    );
}

// Deduplicate missing persons by case_id
export function deduplicateMissingPersons(
    persons: MissingPerson[]
): MissingPerson[] {
    if (!persons || !Array.isArray(persons)) return [];

    const uniquePersons: { [key: string]: MissingPerson[] } = {};

    // Group by case_id
    persons.forEach((person) => {
        if (!person) return;
        const caseId = person.case_id?.toString() || "";
        if (!uniquePersons[caseId]) {
            uniquePersons[caseId] = [];
        }
        uniquePersons[caseId].push(person);
    });

    // For each group, return the first person but combine URLs
    return Object.values(uniquePersons).map((group) => {
        // Use the first record as the base
        const basePerson = { ...group[0] };

        // If there are multiple records, combine the URLs
        if (group.length > 1) {
            basePerson.alternativeUrls = group
                .map((p) => p.url)
                .filter(Boolean);
        }

        return basePerson;
    });
}

// Helper function to extract a shortened description
export function extractShortDescription(description: string | null): string {
    // Remove the structured data parts and keep only relevant information
    if (!description) return "";

    // Remove standard fields that we already display separately
    const shortDesc = description
        .replace(/อายุปัจจุบัน: \d+ ปี\n?/g, "")
        .replace(/อายุขณะหายตัว: \d+ ปี\n?/g, "")
        .replace(/สถานที่หายตัว: [^\n]+\n?/g, "")
        .replace(/วันที่หายตัว: [^\n]+\n?/g, "")
        .trim();

    // Limit to 100 characters and add ellipsis if needed
    if (shortDesc.length > 100) {
        return shortDesc.substring(0, 100) + "...";
    }

    return shortDesc;
}
