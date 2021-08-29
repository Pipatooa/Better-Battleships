import { IGameInfoEvent } from '../../../../shared/network/events/i-game-info';
import { joinTeam } from '../button-functions';

/**
 * Handles a game info event from the server
 *
 * @param  gameInfo Event object to handle
 */
export function handleGameInfo(gameInfo: IGameInfoEvent): void {

    // Set name, author and description field elements using JQuery
    $('#scenario-name-field').text(gameInfo.scenario.descriptor.name);
    $('#scenario-author-field').text(gameInfo.scenario.author);
    $('#scenario-description-field').text(gameInfo.scenario.descriptor.description);

    const teamPaneElement = $('#team-pane');

    // For each team entry in event
    for (const [ name, team ] of Object.entries(gameInfo.scenario.teams)) {

        // Create a new team element with name and description. Add to team pane
        const teamElement = $('<div class="col-md h-100 d-flex flex-column pb-2 px-2"></div>');
        teamElement.append($('<h3></h3>').text(team.descriptor.name));
        teamElement.append($('<p></p>').text(team.descriptor.description));
        teamPaneElement.append(teamElement);

        // Create a new player container element for team's players. Add to team element
        const teamPlayerContainerElement = $('<div class="container flex-grow-1"></div>');
        teamPlayerContainerElement.attr('id', `team-${name}`);
        teamElement.append(teamPlayerContainerElement);

        // Create a new button to join the team. Add to team element
        const buttonElement = $('<button class="btn btn-secondary w-75 mx-auto join-team-button">Join</button>');
        teamElement.append(buttonElement);

        // Register click handler for join team button
        buttonElement.on('click', () => {
            joinTeam(name);
        });
    }
}
