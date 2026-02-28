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
const SECRET = process.env.SECRET;

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

async function getRobloxId(discordId) {
    try {
        const res = await fetch(
            `https://registry.rover.link/api/discord-to-roblox/${discordId}`,
            {
                headers: {
                    Authorization: `Bearer ${ROVER_API_KEY}`
                }
            }
        );

        const data = await res.json();
        return data.robloxId || null;

    } catch (err) {
        console.log("Registry error:", err.message);
        return null;
    }
}

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;

    const hadRole = oldMember.roles.cache.has(BOOSTER_ROLE_ID);
    const hasRole = newMember.roles.cache.has(BOOSTER_ROLE_ID);

    if (hadRole === hasRole) return;

    const robloxId = await getRobloxId(newMember.id);
    if (!robloxId) {
        console.log("User not linked to Roblox.");
        return;
    }

    await fetch(ROBLOX_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SECRET}`
        },
        body: JSON.stringify({
            robloxId,
            isBooster: hasRole
        })
    });

    console.log(`Updated booster for Roblox ID ${robloxId}`);
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
app.get("/", (_, res) => res.send("Bot running"));
app.listen(process.env.PORT || 3000);
