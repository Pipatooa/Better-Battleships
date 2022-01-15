import type { MultipleAttributeInfo }         from '../scenario/i-attribute-info';
import type { IBoardInfo }                    from '../scenario/i-board-info';
import type { IPlayerInfo }                   from '../scenario/i-player-info';
import type { IShipInfo, IShipPrototypeInfo } from '../scenario/i-ship-prototype-info';
import type { IBaseServerEvent }              from './server-event';

/**
 * Event sent when the setup phase of the game begins
 */
export interface ISetupInfoEvent extends IBaseServerEvent {
    event: 'setupInfo',
    boardInfo: IBoardInfo,
    playerInfo: { [identity: string]: IPlayerInfo },
    teamAttributes: { [id: string]: MultipleAttributeInfo },
    scenarioAttributes: MultipleAttributeInfo,
    spawnRegion: string,
    ships: { [trackingID: string]: IShipPrototypeInfo | IShipInfo },
    turnOrder: string[],
    turnStartIndex: number,
    maxTurnTime: number
}
