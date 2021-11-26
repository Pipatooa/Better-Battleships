import { game }                      from '../game';
import { registerGameLinkHandlers }  from './game-link-tooltip';
import { registerInfoPopupHandlers } from './info-popup';
import { MainUIManager }             from './managers/main-ui-manager';
import { ShipPlacer }                from './managers/ship-placer';
import { ready }                     from './misc-buttons';

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
    game.board!.informationGenerator!.clearHighlight();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();

    $('#sidebar-ship-selection-section').remove();
    $('#sidebar-turn-section').removeClass('d-none');
}
