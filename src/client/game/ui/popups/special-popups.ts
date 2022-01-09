import hotkeysHtml               from './html/hotkeys.html';
import shipPlacementTutorialHtml from './html/ship-placement-tutorial.html';
import { Popup }                 from './popup';

/**
 * Registers event listeners for special popup buttons
 */
export function registerSpecialPopupListeners(): void {

    // Popup control buttons
    $('#info-popup-button').on('click', showShipPlacementTutorialPopup);
    $('#hotkey-popup-button').on('click', showHotkeyPopup);

    document.addEventListener('keypress', (ev: KeyboardEvent) => {
        const key = ev.key.toLowerCase();
        switch (key) {
            case 'i':
                showShipPlacementTutorialPopup();
                break;
            case 'h':
                showHotkeyPopup();
                break;
        }
    });
}

/**
 * Shows the ship placement tutorial popup
 */
export function showShipPlacementTutorialPopup(): void {
    new Popup('Ship Placement', shipPlacementTutorialHtml, true);
}

/**
 * Shows the hotkey popup
 */
export function showHotkeyPopup(): void {
    new Popup('Hotkeys', hotkeysHtml, true);
}
