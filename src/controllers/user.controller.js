import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"; 
import { User} from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asynchandler(async (req, res) => {
  //extract the user data from the req body i.e get use data from frontend
  // validation - not empty
  // check if user already exists : email,username
  // check for images,avatar, if available upload to cloudinary
  // create user in db
  // send response to frontend
  // remove password and refresh token from response
  // check for user creation
  // return response with user data
  const {username, email, fullName, password} = req.body;
  if ([username, fullName , email , password ].some((fields) => 
    fields?.trim() === ""
  )){
    throw new ApiError(400, "All fields are required");
  }
  // if (fullName === "" ) {                              // another way to check for empty string
  //   throw new ApiError(400, "Full name is required");
  // }

  const existedUser=User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser){
    throw new ApiError(409, "User already exists with this username or email");
  }

  // check for images
  const avatarLocalPath = req.files?.avatar[0]?.path; // optional chaining to avoid error if avatar is not present
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if ( !avatarLocalPath ){
    throw new ApiError(400, "Avatar is required");
  }
  // upload images to cloudinary
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // create user in db
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password, // password will be hashed in user model pre-save hook
  })

  // remove password and refresh token from response
  const registeredUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!registeredUser) {          // check if user is created
    throw new ApiError(500, "User registration failed");
  }
  // return response with user data
  res.status(201).json(
    new ApiResponse(201, registerUser, "User registered successfully")
  );
});

export { registerUser };
