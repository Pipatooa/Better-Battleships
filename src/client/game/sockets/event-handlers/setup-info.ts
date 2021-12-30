import { initiateRenderers }      from '../../canvas/initiate';
import { game }                   from '../../game';
import { allPlayers, selfPlayer } from '../../player';
import { getAbilities }           from '../../scenario/abilities/ability-getter';
import { Board }                  from '../../scenario/board';
import { RotatablePattern }       from '../../scenario/rotatable-pattern';
import { Ship }                   from '../../scenario/ship';
import { initiateGameSetupUI }    from '../../ui/initiate';
import { setupTurnIndicator }     from '../../ui/updaters/turn-updater';
import type { ISetupInfoEvent }   from 'shared/network/events/i-setup-info';

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
    game.spawnRegion = game.board.regions[setupInfoEvent.playerInfo.spawnRegion];

    // Unpack player colors
    for (const [playerIdentity, color] of Object.entries(setupInfoEvent.playerColors)) {
        const player = allPlayers[playerIdentity];
        [player.color, player.highlightColor] = color;
    }

    // Unpack player info
    const ships: Ship[] = [];
    for (const [trackingID, shipInfo] of setupInfoEvent.playerInfo.ships) {
        const pattern = RotatablePattern.fromSource(shipInfo.pattern);

        // Ship partial refers to future ship object
        const shipPartial: Partial<Ship> = Object.create(Ship.prototype);

        const abilities = getAbilities(shipPartial as Ship, shipInfo.abilities);

        Ship.call(shipPartial, trackingID, undefined, undefined, shipInfo.descriptor, pattern, selfPlayer, abilities);
        console.log(shipPartial);
        ships.push(shipPartial as Ship);
    }

    setupTurnIndicator(setupInfoEvent.turnOrder, setupInfoEvent.maxTurnTime);
    initiateRenderers(ships);
    initiateGameSetupUI();
}
