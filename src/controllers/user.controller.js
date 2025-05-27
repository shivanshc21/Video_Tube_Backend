import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"; 
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessandRefreshTokens = async (userId) =>
{
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken; // save refresh token to user document
    await user.save({ validateBeforeSave: false }); // skip validation for refreshToken field

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError (500, "Something went wrong")
  }
}

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

  const existedUser= await User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser){
    throw new ApiError(409, "User already exists with this username or email");
  }
  // console.log(req.files);
  // check for images
  const avatarLocalPath = req.files?.avatar[0]?.path; // optional chaining to avoid error if avatar is not present
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path; // optional chaining to avoid error if coverImage is not present
  }

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
    new ApiResponse(201, registeredUser, "User registered successfully")
  );
});

const loginUser = asynchandler (async(req,res) => {
  // user data from req body
  // email or username and password
  // check if user exists
  // check password
  // generate access token and refresh token
  // send cookies with tokens

  const { username,email, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{username} , {email}]
  })
  
  if (!user){
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  
  // Genarate access token and refresh token
  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

  const loggedInUser = await User.findById(user_id).select( "-password", "-refreshToken ");

  // send cookies with tokens
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("acccessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User has successfully logged in"
    )
  )
});

const logoutUser = asynchandler( async(req,res) => {
  // clear cookies
  // remove refresh token from user document
  // send response
  User.findByIdAndUpdate(
    await req.user._id,
    {
      $set: {
        refreshToken: undefined
      },
      
    },
    {
      new: true, // return the updated user
    },
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options) // clear access token cookie
    .clearCookie("refreshToken", options) // clear refresh token cookie
    .json(
      new ApiResponse(
        200,
        {},
        "User has successfully logged out"
      )
    )
  
})

export { registerUser, loginUser, logoutUser };
