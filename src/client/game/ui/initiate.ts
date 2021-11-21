import { game }                      from '../game';
import { registerGameLinkHandlers }  from './game-link-tooltip';
import { registerInfoPopupHandlers } from './info-popup';
import { MainUIManager }             from './main-ui-manager';
import { ready }                     from './misc-buttons';
import { ShipPlacer }                from './ship-placer';

/**
 * Initiates all lobby UI managers
 */
export function initiateLobbyUI(): void {
    registerGameLinkHandlers();

    // Miscellaneous buttons
    $('#ready-button').on('click', () => ready(true));
}

/**
 * Initiates all game UI managers for setup phase of game
 */
export function initiateGameSetupUI(): void {
    registerInfoPopupHandlers();

    new ShipPlacer();
}

/**
 * Initiates all game UI managers for main phase of game
 */
export function initiateGameMainUI(): void {
    new MainUIManager();
    game.board!.boardInformationGenerator!.highlightedRegion = undefined;
    game.board!.boardInformationGenerator!.push();

    $('#sidebar-ship-selection-section').remove();
    $('#sidebar-turn-section').removeClass('d-none');
}
