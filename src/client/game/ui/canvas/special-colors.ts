/**
 * Dictionary of colors used for special purposes
 */
export const specialColors = {
    'selection': '#ffffff',
    'valid': '#198754',
    'invalid': '#dc3545',
    'unknown': '#0d6efd',
    'origin': '#ffc107',
    'heading': '#6f42c1'
} as const;

/**
 * Type matching special color name strings
 */
export type SpecialColor = keyof typeof specialColors;
