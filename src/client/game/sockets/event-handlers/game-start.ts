import { IGameStartEvent } from '../../../../shared/network/events/i-game-start';
import { BaseRenderer } from '../../canvas/base-renderer';
import { BoardRenderer } from '../../canvas/board-renderer';
import { Board } from '../../scenario/board';

/**
 * Game testing data
 */
$(document).ready(async () => {
    await handleGameStart({
        'event': 'gameStart',
        'boardInfo': {
            'size': [ 15, 15 ],
            'tileTypes': {
                '.': {
                    'descriptor': {
                        'name': 'Test Tile A',
                        'description': 'A test tile'
                    },
                    'color': '#555555'
                },
                '#': {
                    'descriptor': {
                        'name': 'Test Tile B',
                        'description': 'A test tile'
                    },
                    'color': '#777777'
                }
            },
            'tiles': [
                '...............',
                '.......####....',
                '..#............',
                '..#..#.........',
                '.....#....#....',
                '.....#....#....',
                '.....#....#....',
                '..#.......#....',
                '..#.......#....',
                '..........#....',
                '....###...#....',
                '..........#....',
                '..#.......#....',
                '..#............',
                '.......###.....'
            ]
        },
        'playerInfo': {
            'ships': [
                {
                    'descriptor': {
                        'name': 'Battleship',
                        'description': 'This is a battleship'
                    },
                    'pattern': {
                        'tiles': [
                            [ 0, 0, 1 ],
                            [ 0, 1, 1 ],
                            [ 0, 2, 1 ],
                            [ 0, 3, 1 ],
                            [ 0, 4, 1 ]
                        ]
                    }
                },
                {
                    'descriptor': {
                        'name': 'Cruiser',
                        'description': 'This is a cruiser'
                    },
                    'pattern': {
                        'tiles': [
                            [ 0, 0, 1 ],
                            [ 0, 1, 1 ],
                            [ 0, 2, 1 ],
                            [ 0, 3, 1 ]
                        ]
                    }
                }
            ]
        }
    });
});

/**
 * Handles a game start event from the server
 *
 * @param  gameStartEvent Event object to handle
 */
export async function handleGameStart(gameStartEvent: IGameStartEvent): Promise<void> {

    // Remove lobby from the screen
    $('#lobby-container').remove();

    // Show main game screen
    $('#game-container').removeClass('d-none');

    // Unpack board data
    const board = await Board.fromSource(gameStartEvent.boardInfo);

    // Create new renderer for board
    const gameRenderer = new BaseRenderer($('#game-canvas'));
    new BoardRenderer(gameRenderer, board);
}
