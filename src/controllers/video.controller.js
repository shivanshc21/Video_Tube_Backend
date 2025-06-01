import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"; 
import { Video } from "../models/video.model.js";
import { uploadCloudinary, deleteCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getAllVideos = asynchandler( async(req,res) => {
    const { page=1, limit=10, query, sortBy, sortType, UserId} = req.query;
    // get all videos based on query, sort, pagination

    const filter = {};
    // search query on title or description
    if (query){
        filter=[
            {title: {$regex:query, $options:'i'}},
            {description: {$regex:query, $options:'i'}},
        ];
    }

    // Filter by UserId
    if (UserId && mongoose.Types.ObjectId.isValid(UserId)){
        filter.owner = UserId;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;

    const totalVideos = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((parseInt(page)-1)*parseInt(limit))     // Basically used for pagination and skipping n docs in skip(n)
    .limit(parseInt(limit))                     // parseInt converts string to int 
    .lean();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    totalItems:totalVideos,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalVideos/parseInt(limit))
                }
            },
            "All videos fetched successfully"
        )
    )

})

const publishVideo = asynchandler( async(req,res) => {
    const { title,description,duration } = req.body;
    // get video, upload to Cloudinary, create video
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400,"Video or thumbnail not found")
    }

    const uploadvideo = await uploadCloudinary(videoLocalPath);
    const uploadthumbnail = await uploadCloudinary(thumbnailLocalPath);
    if (!uploadvideo || !uploadthumbnail){
        throw new ApiError(500,"Error in uploading")
    }

    const video = {
        videoFile: uploadvideo.url,
        thumbnail: uploadthumbnail.url,
        title,
        description,
        duration,
        owner:req.user._id
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,video,"Video Published Successfully")
    )
})

export { getAllVideos, publishVideo }