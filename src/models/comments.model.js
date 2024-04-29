import mongoose, {Schema} from "mongoose"

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true
    }
)

export const comment = new mongoose.model("Comment", commentSchema)