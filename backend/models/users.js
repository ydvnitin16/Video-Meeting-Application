import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const User = mongoose.model('User', usersSchema);

export default User;