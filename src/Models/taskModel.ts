import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true, trim: true},
    description: {type: String, trim: true},
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed'],
        default: 'To Do'
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
}, {timestamps: true, versionKey: false});

export const taskModel = mongoose.model("task", taskSchema);