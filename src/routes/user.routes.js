import  { Router } from "express";
import  { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";   // multer is a middleware in uploading files to cloudinary

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "coverImage",                 // taken two objects, one for coverImage and one for avatar
            maxCount: 1
        },
        {
            name: "avatar",     
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt, logoutUser)    
export default router;  