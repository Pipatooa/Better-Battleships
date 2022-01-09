import { game }                  from 'client/game/game';
import { selfPlayer }            from '../../player';
import { Ship }                  from '../../scenario/ship';
import { updateCurrentView }     from '../../ui/managers/view-manager';
import { Message }               from '../../ui/message';
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
    ship.placed = true;
    game.board!.addShip(ship, true);
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();

    // Display update messages to player
    if (ship.player.team !== selfPlayer.team)
        new Message(`Enemy ${ship.descriptor.name} spotted!`);
}
