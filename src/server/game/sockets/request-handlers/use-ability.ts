import Joi            from 'joi';
import {
    IndexedAbility
}                      from 'server/game/scenario/objects/abilities/indexed-ability';
import {
    baseRequestSchema
}                      from 'shared/network/requests/i-client-request';
import {
    PositionedAbility
}                      from '../../scenario/objects/abilities/positioned-ability';
import type { Client }              from '../client';
import type {
    IUseAbilityRequest,
    IUseIndexedAbilityRequest,
    IUsePositionedAbilityRequest
}                      from 'shared/network/requests/i-use-ability';

/**
 * Handles a ship placement request from the client
 *
 * @param  client            Client that made the request
 * @param  useAbilityRequest Request object to handle
 */
export async function handleUseAbilityRequest(client: Client, useAbilityRequest: IUseAbilityRequest): Promise<void> {

    console.log(client.game.scenario.turnManager.currentTurn, client.identity);

    // Check if it is the player's turn
    if (client.game.scenario.turnManager.currentTurn !== client.player)
        return;

    const ship = client.player.ships[useAbilityRequest.ship];
    const ability = ship?.abilities[useAbilityRequest.ability];
    console.log(ship !== undefined, ability !== undefined, useAbilityRequest);
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

    if (ability instanceof IndexedAbility)
        ability.use((useAbilityRequest as IUseIndexedAbilityRequest).index);
    else if (ability instanceof PositionedAbility) {
        let usePositionedAbilityRequest = useAbilityRequest as IUsePositionedAbilityRequest;
        ability.use(usePositionedAbilityRequest.x, usePositionedAbilityRequest.y);
    }
}

/**
 * Schema for validating request JSON
 */
export const baseUseAbilityRequestSchema = baseRequestSchema.keys({
    request: 'useAbility',
    ship: Joi.number().integer().required(),
    ability: Joi.number().integer().required()
});

export const useIndexedAbilityRequestSchema = baseUseAbilityRequestSchema.keys({
    index: Joi.number().integer().required()
});

export const usePositionedAbilityRequestSchema = baseUseAbilityRequestSchema.keys({
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required()
});
