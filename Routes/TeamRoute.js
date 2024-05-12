const express = require("express");
const router = express.Router();
const Team = require("../Modal/TeamModal");
const playersData = require("../data/players.json");
const matchData = require("../data/match.json");
const {CalculateBowlersPoints, CalculateBattersPoints, CalculateWicketKeeperPoints, CalculateAllRoundersPoints} = require("../Services/playerService")

const playersMap = new Map();
for(let player of playersData){
    playersMap.set(player.Player, player);
}

// Route to add teams
router.post("/add-teams", async (req, res) => {
    try {
        // Destructuring data from request body
        const {TeamName, Players, Captain, ViceCaptain} = req.body;

        // Validation: Team must have 11 players
        if(Players.length !== 11) return res.status(400).json("Your Team must have 11 players");
        
        // Arrays to store players based on their teams and roles
        const playerFromCSK = [];
        const playerFromRR = [];
        const listWK = [];
        const listBatter = [];
        const listAR = [];
        const listBowler = [];
        // Loop through each player
        for(let player of Players){
            // Get player details from map
            let playerDetails = playersMap.get(player.name);
            // Categorize players based on their team
            if(playerDetails.Team === "Rajasthan Royals") playerFromRR.push(player.name);
            else if(playerDetails.Team === "Chennai Super Kings") playerFromCSK.push(player.name);
            // Categorize players based on their role
            if(playerDetails.Role === "BATTER") listBatter.push(player.name);
            else if(playerDetails.Role === "ALL-ROUNDER") listAR.push(player.name);
            else if(playerDetails.Role === "BOWLER") listBowler.push(player.name);
            else if(playerDetails.Role === "WICKETKEEPER") listWK.push(player.name);
        }

        // Validation: Maximum of 10 players can be selected from any one of the teams
        if(playerFromCSK.length > 10 || playerFromRR.length > 10) return res.status(400).json("Maximum of 10 players can be selected from any one of the teams");
        // Validation: Min 1 and Max 8 Wicket Keeper are allowed in a team
        if(listWK.length < 1 || listWK.length > 8) return res.status(400).json("Min 1 and Max 8 Wicket Keeper are allowed in a team");
        // Validation: Min 1 and Max 8 Batter are allowed in a team
        if(listBatter.length < 1 || listBatter.length > 8) return res.status(400).json("Min 1 and Max 8 Batter are allowed in a team");
        // Validation: Min 1 and Max 8 All Rounder are allowed in a team
        if(listAR.length < 1 || listAR.length > 8) return res.status(400).json("Min 1 and Max 8 All Rounder are allowed in a team");
        // Validation: Min 1 and Max 8 Bowler are allowed in a team
        if(listBowler.length < 1 || listBowler.length > 8) return res.status(400).json("Min 1 and Max 8 Bowler are allowed in a team");
        
        // Validation: Captain must be from the 11 chosen players
        const captainFlag = Players.find((el) => el.name === Captain);
        if(!captainFlag) return res.status(400).json("Captain Must be from the 11 chosen players");
        
        // Validation: Vice Captain must be from the 11 chosen players
        const viceCaptainFlag = Players.find((el) => el.name === ViceCaptain);
        if(!viceCaptainFlag) return res.status(400).json("Vice Captain Must be from the 11 chosen players");
        
        // Create team in the database
        const team = await Team.create({teamName: TeamName, playersData: Players, captain: Captain, viceCaptain: ViceCaptain});

        // Send success response with team details
        res.status(200).json({msg:"Team Created Successfully", teamDetails: team});
    } catch (error) {
        // Log and send error response
        console.log("Error -> ", error);
        res.status(400).json(error);
    }
})

router.get("/process-result/:teamId", async(req, res)=>{
    try {
        // Extract the teamId from the request parameters
        const teamId = req.params.teamId;
        // Find the team with the specified teamId
        const team = await Team.findById(teamId);
        
        // Initialize variable to track the total points for the team
        let totalTeamsPoint = 0;
        // Calculate total points for each player in the team
        for(let i=0; i<team.playersData.length; i++){
            let player = team.playersData[i];
            let playerDetails  = playersMap.get(player.name);
            
            // Calculate points for different player types
            const bowlerPoint = await CalculateBowlersPoints(playerDetails.Player);
            const batterPoint = await CalculateBattersPoints(playerDetails.Player);
            const arPoint = await CalculateAllRoundersPoints(playerDetails.Player);
            const wkPoint = await CalculateWicketKeeperPoints(playerDetails.Player);
            
            // Calculate total points for the team
            totalTeamsPoint += (batterPoint+bowlerPoint+arPoint+wkPoint);
        }

        // Send the team details and total points in the response
        res.status(200).json({msg:"Response From Process Result", team, totalTeamsPoint});
    } catch (error) {
        // Handle errors
        console.log("Error -> ", error);
        res.status(400).json(error);
    }
})

router.get("/process-result", async(req, res)=>{
    try {
        // Calculate total points for each player and update playersData and playersMap
        for(let i=0; i<playersData.length; i++){
            let playerDetails = playersData[i];
            let totalPlayersPoint = 0;
            
            // Calculate points for different player types
            const bowlerPoint = await CalculateBowlersPoints(playerDetails.Player);
            const batterPoint = await CalculateBattersPoints(playerDetails.Player);
            const arPoint = await CalculateAllRoundersPoints(playerDetails.Player);
            const wkPoint = await CalculateWicketKeeperPoints(playerDetails.Player);
            
            // Calculate total points for the player
            totalPlayersPoint += (batterPoint+bowlerPoint+arPoint+wkPoint);
            playersData[i].totalPoints = totalPlayersPoint;
            let obj = playersMap.get(playerDetails.Player);
            obj.totalPoints = totalPlayersPoint;
            playersMap.set(playerDetails.Player, obj);
        }

        // Send the updated playersData in the response
        res.status(200).json({msg:"Response From Process Result", playersData});
    } catch (error) {
        // Handle errors
        console.log("Error -> ", error);
        res.status(400).json(error);
    }
})

router.get("/team-result", async(req, res) => {
    try {
        // Fetch all teams from the database
        const allTeams = await Team.find();
        
        // Initialize variables to track the winning team and their total points
        let winnerTeam = {name:"", _id:""};
        let highestPoint = 0;

        // Calculate total points for each player and update playersData and playersMap
        for(let i=0; i<playersData.length; i++){
            let playerDetails = playersData[i];
            let totalPlayersPoint = 0;
            
            // Calculate points for different player types
            const bowlerPoint = await CalculateBowlersPoints(playerDetails.Player);
            const batterPoint = await CalculateBattersPoints(playerDetails.Player);
            const arPoint = await CalculateAllRoundersPoints(playerDetails.Player);
            const wkPoint = await CalculateWicketKeeperPoints(playerDetails.Player);
            
            // Calculate total points for the player
            totalPlayersPoint += (batterPoint+bowlerPoint+arPoint+wkPoint);
            playersData[i].totalPoints = totalPlayersPoint;
            let obj = playersMap.get(playerDetails.Player);
            obj.totalPoints = totalPlayersPoint;
            playersMap.set(playerDetails.Player, obj);
        }

        // Iterate through all teams to find the team with the highest total points
        for(let team of allTeams){
            let totalTeamsPoint = 0;
            for(let i=0; i<team.playersData.length; i++){
                let player = team.playersData[i];
                let playerDetails  = playersMap.get(player.name);
                
                // Calculate total points for the team
                totalTeamsPoint += playerDetails.totalPoints;
            }

            // Update winnerTeam if the current team has more total points
            if(totalTeamsPoint > highestPoint){
                highestPoint = totalTeamsPoint;
                winnerTeam.name = team.teamName;
                winnerTeam._id = team._id;
            }
        }

        // Send the winning team and their total points in the response
        res.status(200).json({msg:"Response From Teams Result", winnerTeam, highestPoint});
    } catch (error) {
        // Handle errors
        console.log("Error -> ", error);
        res.status(400).json(error);
    }
})


module.exports = router;