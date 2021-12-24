import Joi                        from 'joi';
import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionDestroyShipSource extends IBaseActionSource {
    type: 'destroyShip',
    ship: 'local' | 'foreign'
}

/**
 * Schema for validating source JSON data
 */
export const actionDestroyShipSchema = baseActionSchema.keys({
    type: 'destroyShip',
    ship: Joi.valid('local', 'foreign').required()
});
