import { Router } from 'express';
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJwt);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").delete(deleteTweet).patch(updateTweet);

export default router;