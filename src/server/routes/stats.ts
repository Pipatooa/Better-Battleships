import express                  from 'express';
import { requireAuth }          from '../middleware';
import type { RequestWithAuth } from '../middleware';

const router = express.Router();
export default router;

/**
 * GET Router handler for /stats
 *
 * Requires auth
 */
router.get('/', requireAuth, async (req, res) => {
    res.render('stats', {
        pageTitle: 'Stats',
        pageDescription: '',
        stylesheets: [
            '/css/style.css',
            '/css/stats.css'
        ],
        scripts: [
            '/js/stats.js'
        ],
        username: (req as RequestWithAuth).auth.username
    });
});
