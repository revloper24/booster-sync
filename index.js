import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

const app = express();

app.get("/", (_, res) => {
    res.send("Booster bot running");
});

app.listen(process.env.PORT || 3000);
