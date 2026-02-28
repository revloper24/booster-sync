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

const GUILD_ID = process.env.GUILD_ID;
const BOOSTER_ROLE_ID = process.env.BOOSTER_ROLE_ID;

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;

    const hadRole = oldMember.roles.cache.has(BOOSTER_ROLE_ID);
    const hasRole = newMember.roles.cache.has(BOOSTER_ROLE_ID);

    if (!hadRole && hasRole) {
        console.log(`${newMember.user.tag} just boosted!`);
    }

    if (hadRole && !hasRole) {
        console.log(`${newMember.user.tag} removed boost.`);
    }
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
app.get("/", (_, res) => {
    res.send("Booster bot running");
});

app.listen(process.env.PORT || 3000);
