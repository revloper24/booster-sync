import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const ROVER_API_KEY = process.env.ROVER_API_KEY;
async function getRobloxId(discordUserId) {
    try {
        const res = await fetch(
            `https://api.rover.link/v2/guilds/${GUILD_ID}/discord-to-roblox/${discordUserId}`,
            {
                headers: {
                    "x-api-key": ROVER_API_KEY
                }
            }
        );

        if (!res.ok) {
            console.log("RoVer API error:", res.status);
            return null;
        }

        const data = await res.json();
        return data.robloxId ?? null;

    } catch (err) {
        console.log("Fetch failed:", err.message);
        return null;
    }
}
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const GUILD_ID = process.env.GUILD_ID;
const BOOSTER_ROLE_ID = process.env.BOOSTER_ROLE_ID;

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;

    const hadRole = oldMember.roles.cache.has(BOOSTER_ROLE_ID);
    const hasRole = newMember.roles.cache.has(BOOSTER_ROLE_ID);

    if (hadRole === hasRole) return;

    const robloxId = await getRobloxId(newMember.id);

    if (!robloxId) {
        console.log(`${newMember.user.tag} booster changed but no linked Roblox account.`);
        return;
    }

    if (hasRole) {
        console.log(`${newMember.user.tag} boosted. Roblox ID: ${robloxId}`);
    } else {
        console.log(`${newMember.user.tag} removed boost. Roblox ID: ${robloxId}`);
    }
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
app.get("/", (_, res) => {
    res.send("Booster bot running");
});

app.listen(process.env.PORT || 3000);
