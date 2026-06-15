import mongoose from 'mongoose';

const roomsSchema = new mongoose.Schema({
    hostedBy: {
        type: String,
        required: true,
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: {
        type: Date,
        default: null,
    },
}, {timestamps: true});

const Room = mongoose.model('Room', roomsSchema);

export default Room;