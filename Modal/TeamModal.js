const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TeamSchema = new Schema({
    teamName: {
        type: String,
        required: true,
    },
    playersData: [{
        name: {
            type: String,
            required: true,
        }
    }], 
    captain: {
        type: String,
        required: true,
    },
    viceCaptain: {
        type: String, 
        required: true,
    }
}, { timestamps: true });

function arrayLimit(val) {
    return val.length <= 11;
}

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;