import escapeHtml from 'escape-html';
import {IGameInfoEvent} from '../../../../shared/network/events/i-game-info';
import {joinTeam} from '../button-functions';

export function handleGameInfo(gameInfo: IGameInfoEvent) {
    $('#scenario-name-field').html(escapeHtml(gameInfo.scenario.descriptor.name));
    $('#scenario-author-field').html(escapeHtml(gameInfo.scenario.author));
    $('#scenario-description-field').html(escapeHtml(gameInfo.scenario.descriptor.description));

    let teamPaneElement = $('#team-pane');

    for (let [name, team] of Object.entries(gameInfo.scenario.teams)) {
        let teamElement = $(`<div class="col-md h-100 d-flex flex-column pb-2 px-2"></div>`);
        teamElement.append($('<h3></h3>').text(team.descriptor.name));
        teamElement.append($('<p></p>').text(team.descriptor.description));
        teamPaneElement.append(teamElement);

        let teamPlayerContainerElement = $(`<div class="container flex-grow-1"></div>`);
        teamPlayerContainerElement.attr('id', `team-${name}`);
        teamElement.append(teamPlayerContainerElement);

        let buttonElement = $(`<button class="btn btn-secondary w-75 mx-auto">Join</button>`);
        teamElement.append(buttonElement);

        buttonElement.on('click', () => {
            joinTeam(name);
        });
    }
}
