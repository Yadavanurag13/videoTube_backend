import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    }, 
    {
        timestamps: true
    })

    //hook

    //don't use arrow function

    //.pre is middleware which will execute before saving 
    userSchema.pre("save", async function(next) {
        //whenever someone changes tha usermode data and save it, each time password gets change
        if(!this.isModified("password")) return next();

        this.password = bcrypt.hash(this.password, 10)
        next()
    })

    //  .methods is property in mongoose to add any method to Schema
    userSchema.methods.isPasswordCorrect = async function(password) {
        return await bcrypt.compare(password, this.password)
    }  
    
    //was geting error becoz using async function which was not require
    userSchema.methods.generateAccessToken = function(){
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }
    //genereation of refreshToken is almost same the only diff is that it has leas no of payload
    userSchema.methods.generateRefreshToken = function(){
        return jwt.sign(
            {
                _id: this._id,
                
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }
    
export const User = mongoose.model("User", userSchema)