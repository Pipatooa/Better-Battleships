import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionAdvanceTurnSource extends IBaseActionSource {
    type: 'advanceTurn';
}

/**
 * Schema for validating source JSON data
 */
export const actionAdvanceTurnSchema = baseActionSchema.keys({
    type: 'advanceTurn'
});
