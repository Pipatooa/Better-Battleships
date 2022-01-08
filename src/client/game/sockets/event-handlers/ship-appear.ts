import { game }                  from 'client/game/game';
import { Ship }                  from '../../scenario/ship';
import { updateCurrentView }     from '../../ui/managers/view-manager';
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

    // Create new ship
    const ship = Ship.fromInfo(shipAppearEvent.shipInfo, shipAppearEvent.trackingID);
    game.board!.addShip(ship, true);
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
