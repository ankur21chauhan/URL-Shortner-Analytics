const cors = require("cors");
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/urlShortner")
.then(() => console.log("MongoDB Connected"))
.catch((err) =>console.log(err));

//SCHEMA
const urlSchema = new mongoose.Schema({
    shortId:{
        type: String,
        required: true,
        unique: true
    },
    originalUrl:{
        type: String,
        required: true
    },
    isCustom:{
        type: Boolean,
        default: false
    },
    clicks:{
        type: Number,
        default: 0
    },
    visitHistory:[
        {
            timestamp:{type: Date}
        }
    ]

});

const URL = mongoose.model("URL",urlSchema);

const express = require("express");
const app = express();

const {nanoid} = require("nanoid");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to URL Shortner :)");
});

app.post("/short", async (req, res) =>{
    try{
        const {url, customId} = req.body;

        if(!url){
            return res.status(400).json({
                error: "URL is required"
            });
        }
        try{
            new global.URL(url);
        }
        catch{
            return res.status(400).json({
                error: "Invalid URL format"
            });
        }

        let shortId;

        const regex = /^[a-zA-Z0-9_-]+$/;
        if(customId && !regex.test(customId)){
            return res.status(400).json({
                error:"Invalid custom ID"
            });
        }

        if(customId){
            const normalizedId = customId.toLowerCase();
            const existing = await URL.findOne({shortId: normalizedId});

            if(existing){
                return res.status(400).json({
                    error: "Custom URL already taken"
                });
            }

            shortId = normalizedId;
        }
        else{
            shortId = nanoid(6);
        }

        await URL.create({
            shortId: shortId,
            originalUrl: url,
            isCustom: !!customId
        });

        res.json({
            shortUrl: `http://localhost:5000/${shortId}`
        });
    }
    catch(err){
        res.status(500).json({
            error:"Server Error"
        });
    }
});





/*Analytics APIs*/
app.get("/analytics/:shortId", async(req, res) =>{
    try{
    const shortId = req.params.shortId;
    const entry = await URL.findOne({shortId});

    if(!entry){
        return res.status(404).json({
            error: "URL not found!"
        });
    }
    res.json({
        totalClicks: entry.clicks,
        visitHistory: entry.visitHistory
    });
    } catch(err){
        res.status(500).json({
            error: "Server Error"
        });
    }

    
});

//Daily Analytics API
app.get("/analytics/:shortId/daily", async(req, res) =>{
    try{
        const{shortId} = req.params;
        const entry = await URL.findOne({shortId});

        if(!entry){
            return res.status(404).json({
                error: "URL not found!"
            });
        }

        const dailyStats = {};

        entry.visitHistory.forEach((visit) =>{
            const date = new Date(visit.timestamp)
            .toISOString()
            .split("T")[0];

            if(!dailyStats[date]){
                dailyStats[date] = 0;
            }
            
            dailyStats[date]++;
        });

        res.json({
            totalClicks: entry.clicks,
            dailyStats
        });
    }

    catch(err){
        res.status(500).json({
            error: "Server Error!"
        });
    }
});

app.get("/analytics/:shortId/last7days",async(req, res) => {
    try{
        const {shortId} = req.params;
        const entry = await URL.findOne({shortId});

        if(!entry){
            return res.status(400).json({
                error: "URL not found!"
            });
        }
        const last7DaysStats= {};
        const today = new Date();

        entry.visitHistory.forEach((visit) => {
            const visitDate = new Date(visit.timestamp);

            //difference in days
            const diffInTime = today - visitDate;
            const diffInDays = diffInTime / (1000*60*60*24);

            //only last 7 days
            if(diffInDays >= 0 && diffInDays <= 7){
                const date = visitDate.toISOString().split("T")[0];

                if(!last7DaysStats[date]){
                    last7DaysStats[date] = 0;
                }
                last7DaysStats[date]++;
            } 
        });
        res.json({
            totalClicks: entry.clicks,
            last7DaysStats
        });
    }
    catch(err){
        res.status(500).json({
            error:"Server Error"
        });
    }
});

const recentHits = new Map();

app.get("/:shortId([a-zA-Z0-9_-]+)", async (req, res) => {
    try {
        const { shortId } = req.params;
        const entry = await URL.findOne({ shortId });

        if (!entry) {
            return res.status(404).json({ error: "URL not Found!" });
        }

        // User ki IP nikalo
        const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const key = `${shortId}:${userIP}`;
        const now = Date.now();
        const lastHit = recentHits.get(key);

        // Same IP se 5 seconds ke andar dobara aaya toh ignore
        if (!lastHit || (now - lastHit) > 5000) {
            recentHits.set(key, now);

            await URL.findOneAndUpdate(
                { shortId },
                {
                    $inc: { clicks: 1 },
                    $push: { visitHistory: { timestamp: new Date() } }
                }
            );
            console.log("REAL Redirect hit", shortId);
        } else {
            console.log("Duplicate skipped", shortId);
        }

        res.redirect(entry.originalUrl);
    }
    catch (err) {
        res.status(500).send("Server Error");
    }
});

app.get("/favicon.ico", (req, res) => res.status(204));


app.listen(5000, () =>{
    console.log("Server running on port 5000");
});

