import express from 'express';
import { preventCSRF, RequestWithAuth, requireAuth } from '../middleware';

const router = express.Router();
export default router;

/**
 * GET Route handler for /
 */
router.get('/', requireAuth, preventCSRF, async (req, res) => {
    
    res.render('index', {
        csrfToken: req.csrfToken(),
        pageTitle: 'Home',
        pageDescription: '',
        stylesheets: [
            '/css/style.css'
        ],
        scripts: [
            '/js/index.js'
        ],
        username: (req as RequestWithAuth).auth.username
    });
});
