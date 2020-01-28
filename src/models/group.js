import mongoose from 'mongoose';

const groupSchema = mongoose.Schema({
    groupName: String,
    groupAdmin: String,
    score: [Number],
    players: [String],
    bets: [[String]],
})

export default mongoose.model('Group', groupSchema);

