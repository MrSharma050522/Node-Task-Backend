const matchData = require("../data/match.json");



module.exports.CalculateBowlersPoints = async function (player) {
    try {
        const playerData = [];
        for(let data of matchData){
            if(data.bowler === player) playerData.push(data);
        }
        let points = 0;
        let totalWicket = 0;
        for(let data of playerData){
            if(data.isWicketDelivery === 1){
                points += 25;
                if(data.kind === "lbw" || data.kind === "caught and bowled" || data.kind === "bowled") points += 8;
            }
            totalWicket += data.isWicketDelivery;
        }

        if(totalWicket >= 3 ) points += ((totalWicket/3) * 4);
        if(totalWicket >= 4 ) points += ((totalWicket/4) * 8);
        if(totalWicket >= 5 ) points += ((totalWicket/5) * 16);

        return points;
    } catch (error) {
        console.log("Error -> ", error);
    }
}

module.exports.CalculateBattersPoints = async function (player) {
    try {
        const playerData = [];
        for(let data of matchData){
            if(data.batter === player) playerData.push(data);
        }
        let points = 0;
        let totalRuns = 0;
        for(let data of playerData){
            if(data.batsman_run === 1 || data.batsman_run === 2 || data.batsman_run === 3) points += data.batsman_run;
            if(data.batsman_run === 4 ) points += data.batsman_run + 1;
            if(data.batsman_run === 6 ) points += data.batsman_run + 2;
        }

        if(totalRuns >= 30 ) points += ((totalRuns/30) * 4);
        if(totalRuns >= 50 ) points += ((totalRuns/50) * 8);
        if(totalRuns >= 100 ) points += ((totalRuns/100) * 16);

        return points;
    } catch (error) {
        console.log("Error -> ", error);
    }
}

module.exports.CalculateWicketKeeperPoints = async function (player) {
    try {
        const playerData = [];
        for(let data of matchData){
            if(data.fielders_involved === player) playerData.push(data);
        }
        let points = 0;
        let totalCatch = 0;
        for(let data of playerData){
            if(data.isWicketDelivery === 1){
                if(data.kind === "caught") points += 8;
                if(data.kind === "stumping") points += 12;
                if(data.kind === "run out") points += 6;
                totalCatch += 1;
            }
        }

        if(totalCatch >= 3) points += ((totalCatch/3) * 4);

        return points;
    } catch (error) {
        console.log("Error -> ", error);
    }
}

module.exports.CalculateAllRoundersPoints = async function (player) {
    try {
        const playerData = [];
        for(let data of matchData){
            if(data.fielders_involved === player) playerData.push(data);
        }
        let points = 0;
        let totalCatch = 0;
        for(let data of playerData){
            if(data.isWicketDelivery === 1){
                if(data.kind === "caught") points += 8;
                if(data.kind === "stumping") points += 12;
                if(data.kind === "run out") points += 6;
                totalCatch += 1;
            }
        }

        if(totalCatch >= 3) points += ((totalCatch/3) * 4);

        return points;
    } catch (error) {
        console.log("Error -> ", error);
    }
}