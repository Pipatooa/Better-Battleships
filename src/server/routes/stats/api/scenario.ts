import express           from 'express';
import { queryDatabase } from '../../../db/query';
import { requireAuth }   from '../../../middleware';

const router = express.Router();
export default router;

/**
 * GET Router handler for /stats/api/scenario
 *
 * Requires auth
 */
router.get('/:hash', requireAuth, async (req, res) => {

    // Verify hash format
    const hash = req.params.hash;
    if (!/[\da-f]{64}/.test(hash)) {
        res.sendStatus(400);
        return;
    }

    // Query database for scenario
    const query = 'SELECT builtin, author, name, description FROM scenario WHERE hash = ?';
    const rows = await queryDatabase(query, hash);
    if (rows.length === 0) {
        res.sendStatus(404);
        return;
    }
    res.send(rows[0]);
});
