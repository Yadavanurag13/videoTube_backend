import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// const registerUser = asyncHandler(async (req, res) => {
//     res.status(200).json({
//         message: "Hello Anurag"
//     })
// })
const generateAccessTokenRefreshToken = async (UserId) => {
    try {
        const user = await User.findById(UserId)

        if(!user) {
            throw new ApiError(404, "User not found")
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //console.log(accessToken)
        //console.log(refreshToken)

        user.refreshToken = refreshToken
        //user.accessToken = accessToken
        //database will demand for validation so we make to false not it will not demand for 
        await user.save({validateBeforeSave: false})


        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh Token");
    }
}
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log(req.body)
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    //console.log(avatarLocalPath)

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatarr file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    //console.log(avatar)
    //console.log(coverImage)
    
    if (!avatar) {
        throw new ApiError(400, "avaatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


//todo 

//username or email
//find the user
//password check karo
//access and refreshtoken generate karke 
//send cookie ans response
const loginUser = asyncHandler(async (req, res) => {
    try {
        const {username, email, password} = req.body
    
        //console.log(username)
    
        if(!username && !email) {
            throw new ApiError(400, "username and email required")
        }
    
        const user = await User.findOne({
            $or: [{username}, {email}]
        })
    
    
    
        if(!user) {
            throw new ApiError(404, "User does not exist");
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password)
    
       if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
        
        const {accessToken, refreshToken} = await generateAccessTokenRefreshToken(user._id)
        
        //console.log(accessToken)
        //console.log(refreshToken)

        const loggedInUser = await User
        .findById(user._id)
        .select("-password -refreshToken") 

        //console.log(loggedInUser)
       
        const options = {
            httpOnly: true,
            secure: true,
    
            //this will enhance the security of cookies 
            //it can be change form server side note the user
        }
        
        const respo = res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User loggedIn Successfully"
            )
        )
        console.log(respo)
        return respo
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Invalid user credentials")
        
    }

})
//cokkies clear krna hoga
//access and refreshtoken has be
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    //for someone using mobile we have to take it from body since cookies can not be sent by 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    //console.log(incomingRefreshToken)
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    //console.log("anuragr")
    //now verifyt the refershtoken

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure : true
        }
    
        //when we have to generate new token we can user generateAccessAndRefershToken method that we have made in userController
    
        const {accessToken, newRefreshToken} = await generateAccessTokenRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                "AccessToken refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refreshToken")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, confPassword} = req.body

    if(newPassword !== confPassword) {
        throw new ApiError(422, "Password Mismatch")
    }

    //for changing current password user is already login so from req we can take id of user

    const user = User.findById(req?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {

    return res
    .status(200)
    .json(
        200,
        req.user,
        "Current User fectched successfully"
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrentUser
}