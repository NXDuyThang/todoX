import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    completedAt: {
        type: Date,
        required: false,
        default: null,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Task', taskSchema);