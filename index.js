import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const GUILD_ID = process.env.GUILD_ID;
const BOOSTER_ROLE_ID = process.env.BOOSTER_ROLE_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Convert Roblox username → UserId
async function getUserIdFromUsername(username) {
    try {
        const res = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: true
            })
        });

        const data = await res.json();

        if (!data.data || data.data.length === 0) return null;

        return data.data[0].id;

    } catch (err) {
        console.log("Roblox API error:", err.message);
        return null;
    }
}

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;

    const hadRole = oldMember.roles.cache.has(BOOSTER_ROLE_ID);
    const hasRole = newMember.roles.cache.has(BOOSTER_ROLE_ID);

    if (hadRole === hasRole) return;

    if (!hasRole) {
        console.log(`${newMember.user.tag} removed boost.`);
        return;
    }

    const nickname = newMember.nickname || newMember.user.username;

    // Extract username inside parentheses
    const match = nickname.match(/\(([^)]+)\)/);

    if (!match) {
        console.log(`${newMember.user.tag} boosted but no (username) format in nickname.`);
        return;
    }

    const robloxUsername = match[1];
    console.log("Extracted Roblox username:", robloxUsername);

    const userId = await getUserIdFromUsername(robloxUsername);

    if (!userId) {
        console.log("Failed to convert username to UserId.");
        return;
    }

    console.log(`${newMember.user.tag} boosted. Roblox UserId: ${userId}`);

    // 🔥 NEXT STEP: Send to Roblox server
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
app.get("/", (_, res) => {
    res.send("Booster bot running");
});

app.listen(process.env.PORT || 3000);
