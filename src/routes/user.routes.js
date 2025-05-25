import  { Router } from "express";
import  { registerUser } from "../controllers/user.controller.js";
import {upload} from "../utils/multer.js";   // multer is a middleware in uploading files to cloudinary

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

export default router;  