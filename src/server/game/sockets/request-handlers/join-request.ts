import Joi from 'joi';
import config from '../../../config';
import {Game} from '../../game';
import {queryGame} from '../../game-manager';
import {Client} from '../client';
import {baseRequestSchema, IBaseRequest} from '../i-request';

export function handleJoinRequest(client: Client, request: IJoinRequest) {

    // Query game manager for an existing game
    let game: Game | undefined = queryGame(request.gameID);

    if (game === undefined) {
        client.ws.close(1013, 'Game does not exist');
        return;
    }

    // Add client to game
    game.joinClient(client);
}

export interface IJoinRequest extends IBaseRequest {
    request: 'join',
    gameID: string
}

export const joinRequestSchema = baseRequestSchema.keys({
    request: 'join',
    gameID: Joi.string().length(config.gameIDLength).required()
});