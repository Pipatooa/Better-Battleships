import express           from 'express';
import { queryDatabase } from '../../../db/query';
import { requireAuth }   from '../../../middleware';

const router = express.Router();
export default router;

/**
 * GET Route handler for /stats/api/user/<username>/games
 *
 * Requires auth
 */
router.get('/:username/games', requireAuth, async (req, res) => {

    const username = req.params.username;
    const resultsPerPage = 20;

    // Get correct page of results
    const rawPage = (req.query.p ?? '0') as string;
    if (!/^\d+$/.test(rawPage)) {
        res.sendStatus(400);
        return;
    }
    const page = parseInt(rawPage);
    const offset = resultsPerPage * page;

    // Query database for games for this user
    const query = 'SELECT game.id, game.game_id, scenario, timestamp, completion, won FROM game JOIN result ON game.id = result.game_id WHERE result.username = ? AND game.completion IS NOT NULL ORDER BY game.id DESC LIMIT ? OFFSET ?;';
    const rows = await queryDatabase(query, [username, resultsPerPage, offset]);
    res.send(rows);
});
