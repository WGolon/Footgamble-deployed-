import mongoose from 'mongoose';

const scheduleModel = mongoose.Schema({
    finished: Number,
    matches: [
        {
        team1: String,
        team2: String,
        startTime: String,
        endTime: String,
        result1: {
            type:String,
            default:'-'
        },
        result2: {
            type:String,
            default:'-'
        },
    }
    ]
})

export default mongoose.model('Schedule', scheduleModel);