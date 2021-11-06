import type { ISetupInfoEvent } from '../../../../shared/network/events/i-setup-info';
import { initGameRenderer } from '../../canvas/game-renderer';
import { game } from '../../game';
import { allPlayers, selfPlayer } from '../../player';
import { Board } from '../../scenario/board';
import { Pattern } from '../../scenario/pattern';
import { Ship } from '../../scenario/ship';

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
    game.board = await Board.fromSource(setupInfoEvent.boardInfo);

    // Unpack player colors
    for (const [playerIdentity, color] of Object.entries(setupInfoEvent.playerColors)) {
        allPlayers[playerIdentity].color = color;
    }

    // Unpack player info
    game.availableShips = [];
    for (const shipInfo of setupInfoEvent.playerInfo.ships) {
        const pattern = Pattern.fromSource(shipInfo.pattern);
        const ship = new Ship(-1, -1, shipInfo.descriptor, pattern, selfPlayer);
        game.availableShips.push(ship);
    }

    initGameRenderer();
}
