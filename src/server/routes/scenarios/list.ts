import express       from 'express';
import { scenarios } from '../../game/scenario/builtin-scenarios';

const router = express.Router();
export default router;

/**
 * GET Route handler for /scenarios/list
 */
router.get('/', async (req, res) => {
    res.send(Object.values(scenarios));
});
