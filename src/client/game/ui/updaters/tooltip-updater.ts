import { TooltipElements } from '../element-cache';
import type { Tile }       from '../../scenario/board';
import type { Ship }       from '../../scenario/ship';

let previouslyDisplayedShip: Ship | undefined;

/**
 * Updates the visibility and contents of the game tooltip
 *
 * @param  infoText Array containing title and info strings to display
 * @param  tileInfo Array containing coordinates and a tile to display information for
 * @param  ship     Ship to display information for
 */
export function updateTooltip(infoText: [string, string] | undefined, tileInfo: [number, number, Tile] | undefined, ship: Ship | undefined): void {

    const infoSectionVisible = infoText !== undefined;
    const tileSectionVisible = tileInfo !== undefined;
    const shipSectionVisible = ship !== undefined;
    const tooltipVisible = infoSectionVisible || tileSectionVisible || shipSectionVisible;

    // Overall tooltip visibility
    TooltipElements.tooltip.setVisibility(tooltipVisible);
    if (!tooltipVisible)
        return;

    // Generic info section
    TooltipElements.infoSection.setVisibility(infoSectionVisible);
    if (infoSectionVisible) {
        TooltipElements.infoTitle.text(infoText![0]);
        TooltipElements.infoText.text(infoText![1]);
    }
    
    // Tile section
    TooltipElements.tileSection.setVisibility(tileSectionVisible);
    if (tileSectionVisible) {
        TooltipElements.tileCoordinates.text(`${tileInfo![0]}, ${tileInfo![1]}`);
        TooltipElements.tileName.text(tileInfo![2][0].descriptor.name);
        TooltipElements.tileTraversable.text(tileInfo![2][0].traversable ? '✓' : '✗');
    }

    // Ship section
    TooltipElements.shipSection.setVisibility(shipSectionVisible);
    if (shipSectionVisible && ship !== previouslyDisplayedShip) {

        // Main ship section
        TooltipElements.shipName.text(ship!.descriptor.name);
        TooltipElements.shipOwner.text(ship!.player.name);

        // Attribute section
        const shipAttributeSectionVisible = ship!.attributeCollection.shouldDisplay;
        TooltipElements.shipAttributeSection.setVisibility(shipAttributeSectionVisible);
        previouslyDisplayedShip?.attributeCollection.doNotDisplayInContainer(TooltipElements.shipAttributeList);
        if (shipAttributeSectionVisible)
            ship!.attributeCollection.displayInContainer(TooltipElements.shipAttributeList);

        previouslyDisplayedShip = ship;
    }
}
