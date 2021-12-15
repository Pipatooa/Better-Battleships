import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionWinSource extends IBaseActionSource {
    type: 'win';
}

/**
 * Schema for validating source JSON data
 */
export const actionWinSchema = baseActionSchema.keys({
    type: 'win'
});
