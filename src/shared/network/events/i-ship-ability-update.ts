import type { IShipUpdateEvent } from './i-ship-update';

/**
 * Event sent when the usability of abilities on a ship have updated
 */
export interface IShipAbilityUpdate extends IShipUpdateEvent {
    event: 'shipAbilityUpdate',
    usability: boolean[]
}
