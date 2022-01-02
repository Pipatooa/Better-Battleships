import { VariableVisibilityElement } from './variable-visibility-element';

/**
 * Cache of all elements composing the game info tooltip
 */
export namespace TooltipElements {
    export const tooltip = new VariableVisibilityElement($('#game-tooltip'));

    export const infoSection = new VariableVisibilityElement($('#game-tooltip-info-section'));
    export const infoTitle = $('#game-tooltip-info-title');
    export const infoText = $('#game-tooltip-info-text');

    export const tileSection = new VariableVisibilityElement($('#game-tooltip-tile-section'));
    export const tileCoordinates = $('#game-tooltip-tile-coordinates');
    export const tileName = $('#game-tooltip-tile-name');
    export const tileTraversable = $('#game-tooltip-tile-traversable');

    export const shipSection = new VariableVisibilityElement($('#game-tooltip-ship-section'));
    export const shipName = $('#game-tooltip-ship-name');
    export const shipOwner = $('#game-tooltip-ship-owner');

    export const shipAttributeSection = new VariableVisibilityElement($('#game-tooltip-ship-attribute-section'));
    export const shipAttributeList = $('#game-tooltip-ship-attribute-list');
}

/**
 * Cache of all elements composing the sidebar
 */
export namespace SidebarElements {
    export const shipSection = new VariableVisibilityElement($('#sidebar-ship-section'));
    export const shipName = $('#sidebar-ship-name');
    export const shipOwner = $('#sidebar-ship-owner');
    export const shipDescription = $('#sidebar-ship-description');

    export const shipAttributeSection = new VariableVisibilityElement($('#sidebar-ship-attribute-section'));
    export const shipAttributeList = $('#sidebar-ship-attribute-list');

    export const shipAbilitySection = new VariableVisibilityElement($('#sidebar-ship-ability-section'));
    export const shipAbilityContainer = $('#sidebar-ship-ability-container');
    export const shipAbilityInfoSection = new VariableVisibilityElement($('#sidebar-ship-ability-info-section'));
    export const shipAbilityName = $('#sidebar-ship-ability-name');
    export const shipAbilityDescription = $('#sidebar-ship-ability-description');
    export const shipAbilityHelpText = $('#sidebar-ship-ability-help-text');
    export const shipAbilityAttributeSection = new VariableVisibilityElement($('#sidebar-ship-ability-attribute-section'));
    export const shipAbilityAttributeList = $('#sidebar-ship-ability-attribute-list');
    export const shipAbilityCanvasWrapper = new VariableVisibilityElement($('#sidebar-ship-ability-canvas-wrapper'));

    export const turnSection = $('#sidebar-turn-section');
    export const turnContainer = $('#sidebar-turn-container');
    export const turnButton = $('#sidebar-turn-button');
    export const turnText = $('#sidebar-turn-text');
    export const turnCountdownSection = new VariableVisibilityElement($('#sidebar-turn-countdown-section'));
    export const turnCountdown = $('#sidebar-turn-countdown');
}
