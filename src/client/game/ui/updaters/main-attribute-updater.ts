import { game }                      from '../../game';
import { selfPlayer }                from '../../player';
import { MainAttributePaneElements } from '../element-cache';

/**
 * Updates the main attribute pane displaying scenario, team and player attributes
 */
export function updateMainAttributePane(): void {

    // Scenario attributes
    const scenarioAttributesVisible = game.scenarioAttributes!.shouldDisplay;
    MainAttributePaneElements.scenarioAttributes.setVisibility(scenarioAttributesVisible);
    if (scenarioAttributesVisible)
        game.scenarioAttributes!.displayInContainer(MainAttributePaneElements.scenarioAttributeList);

    // Team attributes
    const teamAttributesVisible = selfPlayer.team!.attributeCollection!.shouldDisplay;
    MainAttributePaneElements.teamAttributes.setVisibility(teamAttributesVisible);
    if (teamAttributesVisible)
        selfPlayer.team!.attributeCollection!.displayInContainer(MainAttributePaneElements.teamAttributesList);

    // Player attributes
    const playerAttributesVisible = selfPlayer.attributeCollection!.shouldDisplay;
    MainAttributePaneElements.playerAttributes.setVisibility(playerAttributesVisible);
    if (playerAttributesVisible)
        selfPlayer.attributeCollection!.displayInContainer(MainAttributePaneElements.playerAttributesList);

}
