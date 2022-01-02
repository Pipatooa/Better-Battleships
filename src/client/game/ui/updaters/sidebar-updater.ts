import { SidebarElements } from '../element-cache';
import type { Ability }    from '../../scenario/abilities/ability';
import type { Ship }       from '../../scenario/ship';

let previouslyDisplayedShip: Ship | undefined;
let previouslyDisplayedAbility: Ability | undefined;

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
        previouslyDisplayedShip?.attributeCollection.doNotDisplayInContainer(SidebarElements.shipAttributeList);
        previouslyDisplayedShip = undefined;
        return;
    }

    // Main ship section
    SidebarElements.shipName.text(ship!.descriptor.name);
    SidebarElements.shipOwner.text(ship!.player.name);
    SidebarElements.shipDescription.text(ship!.descriptor.description);

    // Ability section
    const abilitySectionVisible = ship!.abilities.length > 0;
    SidebarElements.shipAbilitySection.setVisibility(abilitySectionVisible);
    if (abilitySectionVisible && ship !== previouslyDisplayedShip) {
        SidebarElements.shipAbilityContainer.children().remove();
        for (const ability of ship!.abilities) {
            ability.createGameElement(SidebarElements.shipAbilityContainer);
            ability.gameElement!.on('click', () => abilityCallbacks[0](ability));
            ability.gameElement!.on('mouseenter', () => abilityCallbacks[1](ability));
            ability.gameElement!.on('mouseleave', () => abilityCallbacks[2](ability));
        }
    }

    // Ability info section
    const abilityInfoSectionVisible = ability !== undefined;
    SidebarElements.shipAbilityInfoSection.setVisibility(abilityInfoSectionVisible);
    if (abilityInfoSectionVisible && ability !== previouslyDisplayedAbility) {
        SidebarElements.shipAbilityName.text(ability!.descriptor.name);
        SidebarElements.shipAbilityDescription.text(ability!.descriptor.description);

        // Ability attribute section
        const abilityAttributeSectionVisible = ability!.attributeCollection.shouldDisplay;
        SidebarElements.shipAbilityAttributeSection.setVisibility(abilityAttributeSectionVisible);
        previouslyDisplayedAbility?.attributeCollection.doNotDisplayInContainer(SidebarElements.shipAbilityAttributeList);
        if (abilityAttributeSectionVisible)
            ability!.attributeCollection.displayInContainer(SidebarElements.shipAbilityAttributeList);

        previouslyDisplayedAbility = ability;
    }

    // Attribute section
    const shipAttributeSectionVisible = ship!.attributeCollection.shouldDisplay;
    SidebarElements.shipAttributeSection.setVisibility(shipSectionVisible);
    previouslyDisplayedShip?.attributeCollection.doNotDisplayInContainer(SidebarElements.shipAttributeList);
    if (shipAttributeSectionVisible)
        ship!.attributeCollection.displayInContainer(SidebarElements.shipAttributeList);

    previouslyDisplayedShip = ship;
}
