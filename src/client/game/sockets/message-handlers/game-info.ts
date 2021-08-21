import {IGameInfo} from '../../../../shared/network/i-game-info';
import {escapeHtml} from '../../escape-html';
import {joinTeam} from '../join-team';

export function handleGameInfoMessage(gameInfo: IGameInfo) {
    $('#scenario-name-field').html(escapeHtml(gameInfo.scenario.descriptor.name));
    $('#scenario-author-field').html(escapeHtml(gameInfo.scenario.author));
    $('#scenario-description-field').html(escapeHtml(gameInfo.scenario.descriptor.description));

    let teamPaneElement = $('#team-pane');

    for (let [name, team] of Object.entries(gameInfo.scenario.teams)) {
        let teamElement = $(`<div class="col-md h-100 d-flex flex-column pb-2 px-2"><h3>${escapeHtml(team.descriptor.name)}</h3><p>${escapeHtml(team.descriptor.description)}</p></div>`);
        teamPaneElement.append(teamElement);

        let teamPlayerContainerElement = $(`<div class="container flex-grow-1" id="team-${name}"></div>`);
        teamElement.append(teamPlayerContainerElement);

        let buttonElement = $(`<button class="btn btn-secondary w-75 mx-auto" id="join-team-${name}">Join</button>`);
        teamElement.append(buttonElement);

        buttonElement.on('click', () => {
            joinTeam(name);
        });
    }
}