import type { Ability }                                 from '../objects/abilities/ability';
import type { AttributeReferenceForeignObjectSelector } from '../objects/attribute-references/sources/attribute-reference';
import type { AttributeCodeControlled }                 from '../objects/attributes/attribute-code-controlled';
import type { Player }                                  from '../objects/player';
import type { Ship }                                    from '../objects/ship';
import type { Team }                                    from '../objects/team';
import type { EventInfoEntry }                          from './base-events';

/**
 * Type describing information for resolving relevant objects and values when an event is triggered
 */
export type EventContext<F extends AttributeReferenceForeignObjectSelector, A extends string, L extends string, O extends string>
    = IEventContextBuiltinAttributes<A> & EventContextForeignObjects<F> & IEventContextLocations<L> & Record<O, any>;

/**
 * Interface describing a holder of built-in attributes
 */
interface IEventContextBuiltinAttributes<A extends string> {
    builtinAttributes: Record<A, AttributeCodeControlled>
}

/**
 * Type describing a set of foreign object references on an object
 */
type EventContextForeignObjects<F extends AttributeReferenceForeignObjectSelector | never>
    = [F] extends [never] ? Record<string, unknown>
    : F extends 'team' ? IEventContextForeignTeamObjects : Record<string, unknown>
    & F extends 'player' ? IEventContextForeignPlayerObjects : Record<string, unknown>
    & F extends 'ship' ? IEventContextForeignShipObjects : Record<string, unknown>
    & F extends 'ability' ? IEventContextForeignAbilityObjects : Record<string, unknown>;

/**
 * Type describing a set of foreign object references on an object for a team event
 */
interface IEventContextForeignTeamObjects {
    foreignTeam: Team
}

/**
 * Type describing a set of foreign object references on an object for a player event
 */
interface IEventContextForeignPlayerObjects {
    foreignPlayer: Player
}

/**
 * Type describing a set of foreign object references on an object for a ship event
 */
interface IEventContextForeignShipObjects {
    foreignShip: Ship
}

/**
 * Type describing a set of foreign object references on an object for a ability event
 */
interface IEventContextForeignAbilityObjects {
    foreignAbility: Ability
}

/**
 * Interface describing a holder of built-in attributes
 */
interface IEventContextLocations<L extends string> {
    locations: Record<L, [number, number][]>
}

/**
 * Type matching an event context for a particular event entry
 */
export type EventContextForEvent<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = EventContext<T[X extends undefined ? X : X][0][number], T[X extends undefined ? X : X][1][number], T[X extends undefined ? X : X][2][number], T[X extends undefined ? X : X][3][number]>;

/**
 * Type matching an event context for a generic event entry
 */
export type GenericEventContext = EventContext<any, any, any, any>;
