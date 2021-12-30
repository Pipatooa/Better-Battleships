import { game }                  from 'client/game/game';
import { allPlayers }            from '../../player';
import { getAbilities }          from '../../scenario/abilities/ability-getter';
import { RotatablePattern }      from '../../scenario/rotatable-pattern';
import { Ship }                  from '../../scenario/ship';
import { selfIdentity }          from './connection-info';
import type { IShipAppearEvent } from 'shared/network/events/i-ship-appear';

/**
 * Handles a ship appear event from the server
 *
 * @param  shipAppearEvent Event object to handle
 */
export function handleShipAppear(shipAppearEvent: IShipAppearEvent): void {

    // If ship is owned by player, ignore ship appearance
    if (shipAppearEvent.shipInfo.owner === selfIdentity)
        return;

    // Ship partial refers to future ship object
    const shipPartial: Partial<Ship> = Object.create(Ship.prototype);

    const pattern = RotatablePattern.fromSource(shipAppearEvent.shipInfo.pattern);
    const player = allPlayers[shipAppearEvent.shipInfo.owner];
    const abilities = getAbilities(shipPartial as Ship, shipAppearEvent.shipInfo.abilities);

    // Create new ship
    Ship.call(shipPartial, shipAppearEvent.trackingID, shipAppearEvent.shipInfo.x, shipAppearEvent.shipInfo.y, shipAppearEvent.shipInfo.descriptor, pattern, player, abilities);
    game.board!.addShip(shipPartial as Ship, true);
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
