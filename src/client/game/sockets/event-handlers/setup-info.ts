import { initiateRenderers }      from '../../canvas/initiate';
import { game }                   from '../../game';
import { allPlayers, selfPlayer } from '../../player';
import { AbilityFire }            from '../../scenario/abilities/ability-fire';
import { AbilityMove }            from '../../scenario/abilities/ability-move';
import { AbilityRotate }          from '../../scenario/abilities/ability-rotate';
import { Board }                  from '../../scenario/board';
import { RotatablePattern }       from '../../scenario/rotatable-pattern';
import { Ship }                   from '../../scenario/ship';
import { initiateGameSetupUI }    from '../../ui/initiate';
import { setupTurnIndicator }     from '../../ui/updaters/turn-updater';
import type { Ability }           from '../../scenario/abilities/ability';
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
    game.spawnRegionID = setupInfoEvent.playerInfo.spawnRegion;

    // Unpack player colors
    for (const [playerIdentity, color] of Object.entries(setupInfoEvent.playerColors)) {
        const player = allPlayers[playerIdentity];
        [player.color, player.highlightColor] = color;
    }

    // Unpack player info
    const ships: Ship[] = [];
    for (let shipIndex = 0; shipIndex < setupInfoEvent.playerInfo.ships.length; shipIndex++) {
        const shipInfo = setupInfoEvent.playerInfo.ships[shipIndex];
        const pattern = RotatablePattern.fromSource(shipInfo.pattern);
        const abilities: Ability[] = [];
        for (let abilityIndex = 0; abilityIndex < shipInfo.abilities.length; abilityIndex++) {
            const abilityInfo = shipInfo.abilities[abilityIndex];
            let ability: Ability;
            switch (abilityInfo.type) {
                case 'move':
                    ability = AbilityMove.fromSource(abilityInfo, shipIndex, abilityIndex);
                    break;
                case 'rotate':
                    ability = AbilityRotate.fromSource(abilityInfo, shipIndex, abilityIndex);
                    break;
                case 'fire':
                    ability = AbilityFire.fromSource(abilityInfo, shipIndex, abilityIndex);
                    break;
            }
            abilities.push(ability);
        }

        const ship = new Ship(shipIndex, undefined, undefined, shipInfo.descriptor, pattern, selfPlayer, abilities);
        ships.push(ship);
    }

    setupTurnIndicator(setupInfoEvent.turnOrder, setupInfoEvent.maxTurnTime);
    initiateRenderers(ships);
    initiateGameSetupUI();
}
