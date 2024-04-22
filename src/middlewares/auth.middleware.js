import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


//when we don't use res instead of res we can put _ here
/*export const verifyJwt = asyncHandler(async(req, res, next) => {
    //we can access token by cookies and req.header send Authorization and BearerToken so we requrie 
    //to subtract 
    try {
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        
        // let token;
        // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //     token = req.headers.authorization.split(' ')[1];
        // } else if (req.cookies && req.cookies.accessToken) {
        //     token = req.cookies.accessToken;
        // }

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decoded_token?._id).select("-password -refreshToken")
    
        if(!user) {
            //to_do: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next();
    } catch (error) {
         throw new ApiError(401, error?.message || "Invalid access token")
    }
})*/


// export const verifyJWT = asyncHandler(async(req, _, next) => {
//     try {
//         let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
//         console.log(token);

//         if (!token || typeof token !== 'string') {
//             throw new ApiError(401, "Unauthorized request")
//         }
    
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
//         if (!user) {
            
//             throw new ApiError(401, "Invalid Access Token")
//         }
    
//         req.user = user;
//         next()
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid access token")
//     }
    
// })


const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // token = String(token)
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

export {verifyJWT}