import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the game failed to enter the setup phase
 */
export interface IEnterSetupFailureEvent extends IBaseServerEvent {
    event: 'enterSetupFailure',
    reason: string
}
