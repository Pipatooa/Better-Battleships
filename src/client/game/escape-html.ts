/**
 * Escapes a string including HTML
 * @param source Source string
 * @returns escaped -- Escaped string
 */
export function escapeHtml(source: string): string {
    return new Option(source).innerHTML;
}