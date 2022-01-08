import type { AbilityUsabilityInfo } from '../scenario/ability-usability-info';
import type { IShipUpdateEvent }     from './i-ship-update';

/**
 * Event sent when the usability of abilities on a ship have updated
 */
export interface IShipAbilityUpdate extends IShipUpdateEvent {
    event: 'shipAbilityUpdate',
    usabilityUpdates: (boolean | AbilityUsabilityInfo)[]
}
