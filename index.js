const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();
client.commands = new Discord.Collection();
const { prefix, token, logchannel, activitychannel, chatchannel } = require("./config.json");
require("./Utils/Extensions");
const Verification = require("./Utils/Verification");
const SwearFilter = require("./Utils/SwearFilter");
const ServerCommandManager = require("./ServerCommandManager");

const getCommands = fs.readdirSync("./Commands").filter(f => f.endsWith(".js"));

for (const cmd of getCommands)
{
    const command = require(`./Commands/${cmd}`);
    client.commands.set(command.name, command);
}

client.on("guildMemberAdd", async (member) =>
{
    const channel = member.guild.channels.cache.get(logchannel);

    const blackList = JSON.parse(fs.readFileSync("./Utils/BlacklistedIDs.json", "utf-8").trim());

    if (blackList.includes(member.id))
    {
        await channel.sendEmbed(`BLACKLISTED - ${member} joined the server. They will not be allowed to join the server.`, "Blacklisted Member Joined", 0x00FFFF, [
        {
            name: "ID",
            value: member.id,
            inline: true
        },
        {
            name: "Account Created",
            value: member.user.createdAt,
            inline: true
        }]);
        return;
    }

    await channel.sendEmbed(`${member} joined the server.`, "Member Joined", 0x00FF00, [
        {
            name: "ID",
            value: member.id,
            inline: true
        },
        {
            name: "Account Created",
            value: member.user.createdAt,
            inline: true
        }]);
    if (member.user.bot) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    await Verification.createVerificationChannel(member.guild, member);
});

client.on("guildMemberRemove", (member) =>
{
    const channel = member.guild.channels.cache.get(logchannel);
    channel.sendEmbed(`${member} left the server. (ID: ${member.id})`, "Member Left", 0xFF0000);
});


client.on("ready", () => 
{
    console.log("Ready.");
    client.user.setActivity("you 👀", { type: "WATCHING" });
});

client.on("messageUpdate", (msg, newMsg) =>
{
    if (msg.member.id === "850051991219732512")
        return;
    const channel = msg.guild.channels.cache.get(activitychannel);
    const date = new Date();
    const splitDate = date.toISOString().split("T");
    channel.sendEmbed(`${msg.member} updated [a message](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}) in ${msg.channel}.`, "Message Edited", 0xFFFF00, 
        [
            {
                name: "Full Name",
                value: msg.author.username + "#" + msg.author.discriminator,
                inline: true,
            },
            {
                name: "ID",
                value: msg.member.id,
                inline: true
            },
            {
                name: "Old Message",
                value: msg.content.substr(0, 1023)
            },
            {
                name: "New Message",
                value: newMsg.content.substr(0, 1023)
            }
        ], { text: splitDate[0] + " " + splitDate[1].split(".")[0] + " UTC" }, date, { name: msg.member.displayName, icon_url: msg.author.displayAvatarURL() });
});

client.on("messageDelete", (msg) =>
{
    if (msg.member.id === "850051991219732512")
        return;
    const channel = msg.guild.channels.cache.get(activitychannel);
    const date = new Date();
    const splitDate = date.toISOString().split("T");
    channel.sendEmbed(`${msg.member} deleted a message in ${msg.channel}.`, "Message Deleted", 0xFF0000,
        [
            {
                name: "Full Name",
                value: msg.author.username + "#" + msg.author.discriminator,
                inline: true,
            },
            {
                name: "ID",
                value: msg.member.id,
                inline: true
            },
            {
                name: "Message",
                value: msg.content.substr(0, 1023)
            }
        ], { text: splitDate[0] + " " + splitDate[1].split(".")[0] + " UTC" }, date, { name: msg.member.displayName, icon_url: msg.author.displayAvatarURL() });
});

client.on("messageDeleteBulk", (msgs) =>
{
});

client.on("message", (msg) => 
{
    if (msg.channel.id === chatchannel && msg.author.id === "840682445732839434")
        return ServerCommandManager.checkCommand(msg);

    if (msg.author.bot) return;
    if (msg.guild == null)
    {
        const blackList = JSON.parse(fs.readFileSync("./Utils/BlacklistedIDs.json", "utf-8").trim());
        if (blackList.includes(msg.author.id))
            return msg.author.sendEmbed("Sorry, something went wrong :/");
        const guild = client.guilds.cache.get("848303719375831082");
        Verification.createVerificationChannel(guild, msg.author);
        return;
    }

    msg.guild.memberDatas = JSON.parse(fs.readFileSync("./Data/MemberData.json", "utf-8").trim());
    msg.member.data = msg.guild.memberDatas[msg.member.id] ?? {};

    SwearFilter.checkForBannedPhrasesAndSwears(msg);
    
    if (!msg.content.startsWith(prefix)) return;
    
    msg.guild.prefix = prefix;
    const args = msg.content.slice(prefix.length).split(" ");
    const commandName = args.shift();
    const command = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));
    
    if (!command) return;
    
    if (command.requireVerification) return;

    if (command.requireRole)
    {
        if (!msg.member.roles.cache.get(command.requireRole))
            return msg.channel.sendEmbed(`Sorry, this command is only available for <@&${command.requireRole}>.`);
    }

    if (command.serverOnly) return msg.channel.sendEmbed("Sorry, that command is for server use only.");
    
    try
    {
        command.execute(msg, args);
    }
    catch (e)
    {
        console.error(e);
        msg.channel.sendEmbed(`This command experienced an error... Whoops.\n\n\`${e}\``, "Error", 0xFF0000);
    }
});

client.login(token);