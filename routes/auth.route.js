import express from 'express';
import { signin, signup, google, signout, verify, sentEmail } from '../controllers/auth.controller.js';

const router = express.Router();

/**  
* @openapi
* /api/auth/signup:
* post:
* summary: Sign Up new account
* description: Post a new account to add to database. Not verified yet. Still on work email verified.
* parameters:
* — in: path
* schema:
* type: string
* responses:
* 200:
* description: Successful response
*/
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.get('/signout', signout);

router.get('/verify/:userId/:uniqueString', verify);
router.post('/verify/sendemail', sentEmail)

export default router;