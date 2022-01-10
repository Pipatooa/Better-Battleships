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

    // Filter by game ID string start
    if (gameID !== '') {
        if (!/^\d*$/.test(gameID)) {
            res.sendStatus(400);
            return;
        }
        conditions.push('game_id LIKE ?');
        values.push(gameID + '%');
    }

    // Filter by scenario
    const scenario = req.query.scenario as string | undefined;
    if (scenario !== undefined) {
        if (!/[\da-f]{64}/.test(scenario)) {
            res.sendStatus(400);
            return;
        }
        conditions.push('scenario = ?');
        values.push(scenario);
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
    const query = `SELECT id, game_id, scenario, timestamp, completion FROM game WHERE ${subQuery} ORDER BY id DESC LIMIT ? OFFSET ?;`;
    const rows = await queryDatabase(query, values);
    res.send(rows);
});
