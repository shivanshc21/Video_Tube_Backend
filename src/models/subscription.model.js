import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schesma.Types.ObjectId,    // the user who is subscribing to a channel.
        ref: "User"
    },
    channel:{
        type: Schesma.Types.ObjectId,   // to whom the subscriber is subscribing.
        ref: "User"
    }
},
{
    timestamps: true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);