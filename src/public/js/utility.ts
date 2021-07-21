// Constrains a value between two other values
export function clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(value, maximum));
}