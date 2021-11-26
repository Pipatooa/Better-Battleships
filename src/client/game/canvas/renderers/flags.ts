/**
 * Border flags used to describe which borders are present on a ship
 *
 * N = Negative
 * P = Positive
 */
export const enum BorderFlag {
    NXNY = 1,
    NY = 2,
    PXNY = 4,
    NX = 8,
    PX = 16,
    NXPY = 32,
    PY = 64,
    PXPY = 128
}
