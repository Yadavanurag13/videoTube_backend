import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            required: true
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true

        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
            required: true

        }, 
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        }
    },
    {
        timestamps: true
    }
)