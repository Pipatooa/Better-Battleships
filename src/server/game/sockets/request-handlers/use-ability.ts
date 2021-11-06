import Joi from 'joi';
import { baseRequestSchema } from '../../../../shared/network/requests/i-client-request';
import type { IUseAbilityRequest } from '../../../../shared/network/requests/i-use-ability';
import { IndexedAbility, PositionedAbility } from '../../scenario/objects/abilities/ability';
import { EvaluationContext } from '../../scenario/evaluation-context';
import type { Client } from '../client';

/**
 * Handles a ship placement request from the client
 *
 * @param  client            Client that made the request
 * @param  useAbilityRequest Request object to handle
 */
export async function handleUseAbilityRequest(client: Client, useAbilityRequest: IUseAbilityRequest): Promise<void> {

    // Check if it is the player's turn
    if (client.game.scenario.turnManager.currentTurn !== client.identity)
        return;

    // Check if the ship exists
    if (useAbilityRequest.ship < 0 || useAbilityRequest.ship >= client.player!.ships.length)
        return;

    const ship = client.player!.ships[useAbilityRequest.ship];
    const ability = ship.abilities[useAbilityRequest.ability];
    if (ability === undefined)
        return;

    // Determine subtype schema depending on ability
    let abilitySubtypeSchema: Joi.Schema | undefined;
    if (ability instanceof IndexedAbility)
        abilitySubtypeSchema = useIndexedAbilityRequestSchema;
    else if (ability instanceof PositionedAbility)
        abilitySubtypeSchema = usePositionedAbilityRequestSchema;

    // Validate ability against schema for ability subtype
    if (abilitySubtypeSchema !== undefined) {
        try {
            useAbilityRequest = await abilitySubtypeSchema.validateAsync(useAbilityRequest);
        } catch (e: unknown) {
            if (e instanceof Joi.ValidationError) {
                client.ws.close(1002, e.message);
                return;
            }
            throw e;
        }
    }

    // Use ability under new evaluation context
    const useAbilityRequestCast = useAbilityRequest as any;
    const evaluationContext = new EvaluationContext(client.game.scenario, client.team, client.player, ship, useAbilityRequestCast.index, useAbilityRequestCast.x, useAbilityRequestCast.y);
    ability?.use(evaluationContext);
}

/**
 * Schema for validating request JSON
 */
export const baseUseAbilityRequestSchema = baseRequestSchema.keys({
    request: 'useAbility',
    ship: Joi.string().required(),
    ability: Joi.string().required()
});

export const useIndexedAbilityRequestSchema = baseUseAbilityRequestSchema.keys({
    index: Joi.number().integer().required()
});

export const usePositionedAbilityRequestSchema = baseUseAbilityRequestSchema.keys({
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required()
});
