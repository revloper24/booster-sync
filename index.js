import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const GUILD_ID = process.env.GUILD_ID;
const BOOSTER_ROLE_ID = process.env.BOOSTER_ROLE_ID;
const ROVER_API_KEY = process.env.ROVER_API_KEY;
const ROBLOX_ENDPOINT = process.env.ROBLOX_ENDPOINT;

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;

    const hadRole = oldMember.roles.cache.has(BOOSTER_ROLE_ID);
    const hasRole = newMember.roles.cache.has(BOOSTER_ROLE_ID);

    if (hadRole === hasRole) return;

    try {
        // 1️⃣ Get Roblox ID from RoVer
        const roverRes = await fetch(
            `https://registry.rover.link/api/discord-to-roblox/${newMember.id}`,
            {
                headers: {
                    Authorization: `Bearer ${ROVER_API_KEY}`
                }
            }
        );

        const data = await roverRes.json();

        if (!data.robloxId) {
            console.log("User not verified with RoVer.");
            return;
        }

        const robloxId = data.robloxId;

        // 2️⃣ Send to Roblox
        await fetch(ROBLOX_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                robloxId: robloxId,
                isBooster: hasRole
            })
        });

        console.log(`Updated booster for RobloxId ${robloxId}`);

    } catch (err) {
        console.log("Error:", err.message);
    }
});

client.login(process.env.DISCORD_TOKEN);

// Keep alive
const app = express();
app.get("/", (_, res) => res.send("Bot running"));
app.listen(process.env.PORT || 3000);
