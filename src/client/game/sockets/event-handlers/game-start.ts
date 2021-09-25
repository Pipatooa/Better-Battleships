import { IGameStartEvent } from '../../../../shared/network/events/i-game-start';
import { gameRenderer, initGameRenderer } from '../../canvas/game-renderer';
import { PatternRenderer } from '../../canvas/pattern-renderer';
import { game } from '../../game';
import { allPlayers, selfPlayer } from '../../player';
import { Board } from '../../scenario/board';
import { Pattern } from '../../scenario/pattern';
import { Ship } from '../../scenario/ship';

/**
 * Game testing data
 */
/*$(document).ready(async () => {
    await handleGameStart({
        'event': 'gameStart',
        'boardInfo': {
            'size': [15, 15],
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
                            [0, 0, null],
                            [0, 1, null],
                            [0, 2, null],
                            [0, 3, null],
                            [0, 4, null]
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
                            [0, 0, null],
                            [0, 1, null],
                            [0, 2, null],
                            [0, 3, null]
                        ]
                    }
                }
            ]
        },
        'teamInfo': {
            'blue': {
                'descriptor': {
                    'name': 'Blue Team',
                    'description': 'This is the blue team'
                },
                'maxPlayers': 0,
                'color': '#0000FF',
                'players': [
                    'user:Test'
                ]
            },
            'red': {
                'descriptor': {
                    'name': 'Red Team',
                    'description': 'This is the red team'
                },
                'maxPlayers': 0,
                'color': '#FF0000',
                'players': [
                    'user:Timmy'
                ]
            }
        }
    });
});*/

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
    game.board = await Board.fromSource(gameStartEvent.boardInfo);

    // Unpack player colors
    for (const [playerIdentity, color] of Object.entries(gameStartEvent.playerColors)) {
        allPlayers[playerIdentity].color = color;
    }

    // Unpack player info
    game.availableShips = [];
    for (const shipInfo of gameStartEvent.playerInfo.ships) {
        const pattern = Pattern.fromSource(shipInfo.pattern);
        const ship = new Ship(-1, -1, shipInfo.descriptor, pattern, selfPlayer);
        game.availableShips.push(ship);
    }

    initGameRenderer();
}
