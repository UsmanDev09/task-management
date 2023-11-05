import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "ongoing", "completed"],
        default: "pending"
    },
}, {
    timestamps: true
});

TaskSchema.index({ _id: 1, user: 1 }, { unique: true })

const Task = mongoose.model('Task', TaskSchema);

export default Task
