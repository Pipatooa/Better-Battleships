/**
 * Type which makes an type mutable
 */
export type Mutable<T> = {
    -readonly [K in keyof T]: T[K]
};
