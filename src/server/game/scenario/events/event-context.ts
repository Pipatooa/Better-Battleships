import type { Ability }                        from '../objects/abilities/ability';
import type {
    AttributeReferenceForeignObjectSelector
}                                       from '../objects/attribute-references/sources/attribute-reference';
import type { AttributeCodeControlled } from '../objects/attributes/attribute-code-controlled';
import type { Player }                  from '../objects/player';
import type { Ship }                    from '../objects/ship';
import type { Team }                    from '../objects/team';
import type { EventInfoEntry }          from './base-events';

/**
 * Type alias for event context A type
 */
export type ECA = string;

/**
 * Type alias for event context F type
 */
export type ECF = AttributeReferenceForeignObjectSelector;

/**
 * Type describing information for resolving relevant objects and values when an event is triggered
 */
export type EventContext<F extends ECF, A extends ECA>
    = IEventContextBuiltinAttributes<A> & EventContextForeignObjects<F>;

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
 * Type matching an event context for a particular event entry
 */
export type EventContextForEvent<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = EventContext<T[X extends undefined ? X : X][0][number], T[X extends undefined ? X : X][1][number]>;

export type GenericEventContext = EventContext<any, any>;
