import { game }                 from '../../game';
import { allPlayers }           from '../../player';
import { Board }                from '../../scenario/board';
import { Ship }                 from '../../scenario/ship';
import { initiateRenderers }    from '../../ui/canvas/initiate';
import { initiateGameSetupUI }  from '../../ui/initiate';
import { setupTurnIndicator }   from '../../ui/updaters/turn-updater';
import type { ISetupInfoEvent } from 'shared/network/events/i-setup-info';

/**
 * Handles a setup info event from the server
 *
 * @param  setupInfoEvent Event object to handle
 */
export async function handleSetupInfo(setupInfoEvent: ISetupInfoEvent): Promise<void> {

    // Alter which screens are visible
    $('#lobby-container').remove();
    $('#game-container').removeClass('d-none');

    // Unpack board data
    game.board = await Board.fromInfo(setupInfoEvent.boardInfo);
    game.spawnRegion = game.board.regions[setupInfoEvent.spawnRegion];

    // Unpack player info
    for (const [identity, info] of Object.entries(setupInfoEvent.playerInfo)) {
        const player = allPlayers[identity];
        player.color = info.color;
        player.highlightColor = info.highlightColor;
    }

    // Unpack ship info
    const ships: Ship[] = [];
    for (const [trackingID, shipInfo] of Object.entries(setupInfoEvent.ships)) {
        const ship = Ship.fromInfo(shipInfo, trackingID);
        ships.push(ship);
    }

    setupTurnIndicator(setupInfoEvent.turnOrder, setupInfoEvent.maxTurnTime);
    initiateRenderers(ships);
    initiateGameSetupUI();
}
