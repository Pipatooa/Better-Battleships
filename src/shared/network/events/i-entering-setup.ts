import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the game is entering the setup phase
 */
export interface IEnteringSetupEvent extends IBaseServerEvent {
    event: 'enteringSetup',
    waitDuration: number
}
