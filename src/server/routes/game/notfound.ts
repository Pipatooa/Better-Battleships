import express from 'express';
import { RequestWithAuth, requireAuth } from '../../middleware';

const router = express.Router();
export default router;

/**
 * GET Route handler for /game/notfound
 */
router.get('/', requireAuth, async (req, res) => {

    res.render('game-not-found', {
        pageTitle: 'Game Not Found',
        pageDescription: '',
        stylesheets: [
            '/css/style.css'
        ],
        scripts: [
            '/js/game-not-found.js'
        ],
        username: (req as RequestWithAuth).auth.username
    });
});
