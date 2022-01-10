import express           from 'express';
import { queryDatabase } from '../../../db/query';
import { requireAuth }   from '../../../middleware';

const router = express.Router();
export default router;

/**
 * GET Route handler for /stats/api/game
 *
 * Requires auth
 */
router.get('/:id', requireAuth, async (req, res) => {

    // Check id format
    const rawInternalGameID = req.params.id;
    if (!/^\d+$/.test(rawInternalGameID)) {
        res.sendStatus(400);
        return;
    }

    // Query database for game details
    const internalGameID = parseInt(rawInternalGameID);
    const gameQuery = 'SELECT game_id, scenario, timestamp, completion FROM game WHERE id = ? AND completion IS NOT NULL;';
    const gameRows = await queryDatabase(gameQuery, internalGameID);
    if (gameRows.length === 0) {
        res.sendStatus(404);
        return;
    }

    // Query database for game results
    const resultQuery = 'SELECT username, won FROM result WHERE game_id = ?';
    const resultRows = await queryDatabase(resultQuery, internalGameID);
    if (resultRows.length === 0) {
        res.sendStatus(500);
        return;
    }

    // Reformat results
    const results: { [username: string]: 0 | 1 } = {};
    for (const row of resultRows)
        results[row.username] = row.won;

    res.send({
        ...gameRows[0],
        results: results
    });
});
