import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        videos: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        users: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, 
    {
        timestamps: true
    }
)

export const Playlist = new mongoose.model("Playlist", playlistSchema)