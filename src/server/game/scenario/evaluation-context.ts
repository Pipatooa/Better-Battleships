import type { Player }   from './objects/player';
import type { Scenario } from './objects/scenario';
import type { Ship }     from './objects/ship';
import type { Team }     from './objects/team';

/**
 * UsageContext - Server Version
 *
 * Stores information for resolving relevant objects when an ability is used and subsequent logic is executed
 */
export class EvaluationContext {

    /**
     * UsageContext constructor
     *
     * @param  scenario Scenario in which the ability was used
     * @param  team     Team under which the ability was used
     * @param  player   Player under which the ability was used
     * @param  ship     Ship under which the ability was used
     * @param  index    Sub-ability index
     * @param  x        X coordinate where ability was used
     * @param  y        Y coordinate where ability was used
     */
    public constructor(public readonly scenario?: Scenario,
                       public readonly team?: Team,
                       public readonly player?: Player,
                       public readonly ship?: Ship,
                       public readonly index?: number,
                       public readonly x?: number,
                       public readonly y?: number) {
    }
}
