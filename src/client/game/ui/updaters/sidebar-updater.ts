import { game }            from '../../game';
import { SidebarElements } from '../element-cache';
import type { Ability }    from '../../scenario/abilities/ability';
import type { Ship }       from '../../scenario/ship';

let lastDisplayedShip: Ship | undefined;

/**
 * Updates the contents of the ship section of the sidebar
 *
 * @param  ship             Ship to display information for
 * @param  ability          Ability to display information for
 * @param  abilityCallbacks Array of callbacks for each ability for [click, mouseenter, mouseleave]
 */
export function updateSidebarShipSection(ship: Ship | undefined,
                                         ability: Ability | undefined,
                                         abilityCallbacks: [
                                             (ability: Ability) => void,
                                             (ability: Ability) => void,
                                             (ability: Ability) => void
                                         ]): void {

    // Overall section visibility
    const shipSectionVisible = ship !== undefined;
    SidebarElements.shipSection.setVisibility(shipSectionVisible);
    if (!shipSectionVisible) {
        lastDisplayedShip = undefined;
        return;
    }

    // Main ship section
    SidebarElements.shipName.text(ship!.descriptor.name);
    SidebarElements.shipOwner.text(ship!.player.name);
    SidebarElements.shipDescription.text(ship!.descriptor.description);

    // Ability section
    const abilitySectionVisible = ship!.abilities.length > 0;
    SidebarElements.shipAbilitySection.setVisibility(abilitySectionVisible);
    if (abilitySectionVisible && ship !== lastDisplayedShip) {
        SidebarElements.shipAbilityContainer.children().remove();
        for (const ability of ship!.abilities) {
            ability.createGameElement(SidebarElements.shipAbilityContainer);
            ability.gameElement!.on('click', () => abilityCallbacks[0](ability));
            ability.gameElement!.on('mouseenter', () => abilityCallbacks[1](ability));
            ability.gameElement!.on('mouseleave', () => abilityCallbacks[2](ability));
        }
    }

    // Ability Info Section
    const abilityInfoSectionVisible = ability !== undefined;
    SidebarElements.shipAbilityInfoSection.setVisibility(abilityInfoSectionVisible);
    if (abilityInfoSectionVisible) {
        SidebarElements.shipAbilityName.text(ability!.descriptor.name);
        SidebarElements.shipAbilityDescription.text(ability!.descriptor.description);
    }
    if (SidebarElements.shipAbilityInfoSection.visibilityChanged)
        game.abilityRenderer!.viewportHandler.updateViewport(true);
    
    lastDisplayedShip = ship;
}
