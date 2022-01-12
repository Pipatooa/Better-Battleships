import express           from 'express';
import { queryDatabase } from '../../../db/query';
import { requireAuth }   from '../../../middleware';

const router = express.Router();
export default router;

/**
 * GET Route handler for /stats/api/games
 *
 * Requires auth
 */
router.get('/', requireAuth, async (req, res) => {

    const gameID = req.query.id as string ?? '';
    const resultsPerPage = 20;

    // Query sub-elements
    const conditions: string[] = ['completion IS NOT NULL'];
    const values: (number | string)[] = [];
    let joinResults = false;

    // Filter by game ID string start
    if (gameID !== '') {
        if (!/^\d*$/.test(gameID)) {
            res.sendStatus(400);
            return;
        }
        conditions.push('game.game_id LIKE ?');
        values.push('%' + gameID + '%');
    }

    // Filter by scenario hash
    const scenario = req.query.scenario as string | undefined;
    if (scenario !== undefined) {
        if (!/[\da-f]{64}/.test(scenario)) {
            res.sendStatus(400);
            return;
        }
        conditions.push('scenario = ?');
        values.push(scenario);
    }

    // Filter by builtin scenario
    const builtin = req.query.builtin as string | undefined;
    if (builtin !== undefined) {
        if (!/[10]/.test(builtin)) {
            res.sendStatus(400);
            return;
        }
        conditions.push(`scenario.builtin = ${parseInt(builtin) ? 'TRUE' : 'FALSE'}`);
    }

    // Filter by username
    const username = req.query.user as string | undefined;
    if (username !== undefined && username.length > 0) {
        joinResults = true;
        conditions.push('result.username = ?');
        values.push(username);
    }

    // Get correct page of results
    const rawPage = (req.query.p ?? '0') as string;
    if (!/^\d+$/.test(rawPage)) {
        res.sendStatus(400);
        return;
    }
    const page = parseInt(rawPage);
    const offset = resultsPerPage * page;

    values.push(resultsPerPage);
    values.push(offset);

    // Query database for games
    const subQuery = conditions.join(' AND ');
    const query = `SELECT game.id, game.game_id, scenario, hash, name, description, timestamp, completion, scenario.builtin FROM game JOIN scenario ON game.scenario = scenario.hash ${joinResults ? 'JOIN result ON result.game_id = game.id ' : ''}WHERE ${subQuery} ORDER BY game.id DESC LIMIT ? OFFSET ?;`;
    const rows = await queryDatabase(query, values);
    res.send(rows);
});
