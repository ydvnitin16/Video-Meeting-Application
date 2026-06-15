import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    participantId: {
        type: String,
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: {
        type: Date,
        default: null,
    },
    
}, {timestamps: true});

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;