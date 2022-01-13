import { game }                  from '../../game';
import type { BoardUpdateEvent } from 'shared/network/events/board-update';

/**
 * Handles a board update event from the server
 *
 * @param  boardUpdateEvent Event object to handle
 */
export function handleBoardUpdate(boardUpdateEvent: BoardUpdateEvent): void {
    if (boardUpdateEvent.full)
        game.board!.updateAllTiles(boardUpdateEvent.tiles);
    else
        game.board!.updateTiles(boardUpdateEvent.tiles);

    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
