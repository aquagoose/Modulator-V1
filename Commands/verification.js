const Verification = require("../Utils/Verification");
const { servercommandschannel } = require("../config.json");
const fs = require("fs");

const commands = 
{
    sendtoall:
    {
        description: "Send a message to all currently open verification channels.",
        execute(msg, args)
        {
            let channels = msg.guild.channels.cache.filter(c => c.parent?.id === "848982654841389077");
            for (const channel of channels.array())
            {
                channel.sendEmbed(args.join(" "));
            }
        }
    },

    stage2:
    {
        description: "Mark a verification as suspicious.",
        execute(msg, args)
        {
            const member = msg.guild.members.cache.find(m => m.id === args[0] || m.displayName === args[0]) ?? msg.mentions.members.first();
            if (!member)
                return msg.channel.sendEmbed("I can't find that member!");
            member.data = msg.guild.memberDatas[member.id] ?? {};
            member.data["verified"] = false;
            member.data["sus"] = true;
            member.saveData();
            member.roles.remove("848976638442995773");
            msg.guild.channels.cache.get(servercommandschannel).send(`;;!whitelist remove ${member.data["steam-id"]}`);
            Verification.createVerificationChannel(msg.guild, member, true);
            msg.channel.sendEmbed("Successfully marked that user as suspicious. They will be required to go through verification again.");
        }
    },

    approve:
    {
        description: "Verify the given ID.",
        async execute(msg, args)
        {
            const member = msg.guild.members.cache.find(m => m.id === args[0] || m.displayName === args[0]) ?? msg.mentions.members.first();
            if (!member)
                return msg.channel.sendEmbed("I can't find that member!");
            member.data = msg.guild.memberDatas[member.id] ?? {};
            member.data["verified"] = true;
            delete member.data["sus"];
            member.saveData();
            msg.guild.channels.cache.get(servercommandschannel).send(`;;!whitelist add ${member.data["steam-id"]}`);
            member.roles.remove("851119566661877800");
            member.roles.add("848976638442995773");
            let channel = msg.guild.channels.cache.filter(c => c.parent?.id === "848982654841389077" && c.type === "text" && c.topic?.startsWith(member.id)).first();
            channel.sendEmbed("A staff member has decided to verify you.\n\nThis channel will go boom in 10 seconds...");
            msg.channel.sendEmbed(`<@${member.id}>'s verification has been **approved**!`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            channel.delete();
        }
    },

    deny:
    {
        description: "Deny & blacklist the given user.",
        async execute(msg, args)
        {
            const member = msg.guild.members.cache.find(m => m.id === args[0] || m.displayName === args[0]) ?? msg.mentions.members.first();
            if (!member)
                return msg.channel.sendEmbed("I can't find that member!");
            delete msg.guild.memberDatas[member.id];
            fs.writeFileSync("./Data/MemberData.json", JSON.stringify(msg.guild.memberDatas));
            let channel = msg.guild.channels.cache.filter(c => c.parent?.id === "848982654841389077" && c.type === "text" && c.topic?.startsWith(member.id)).first();
            channel.send(`<@${member.id}>`);
            channel.sendEmbed("Unfortunately, a staff member has chosen to **deny** your verification. You will not be able to attempt any more verifications, unless a staff member allows you to.\n\nDeleting channel in 2 minutes.");
            let blackList = JSON.parse(fs.readFileSync("./Utils/BlacklistedIDs.json", "utf-8").trim());
            blackList.push(member.id);
            fs.writeFileSync("./Utils/BlacklistedIDs.json", JSON.stringify(blackList));
            msg.channel.sendEmbed(`<@${member.id}>'s verification has been **denied** and **blacklisted**.`);
            await new Promise(resolve => setTimeout(resolve, 120000));
            channel.delete();
        }
    },

    sendtochannel:
    {
        description: "Send an anonymous message to the given channel.",
        execute (msg, args)
        {
            let getChannel = args.shift();
            let channel = msg.guild.channels.cache.find(c => c.id === getChannel || c.name === getChannel) ?? msg.mentions.channels.first();
            channel.sendEmbed(args.join(" "));
        }
    },

    blacklist:
    {
        description: "Blacklist the given user.",
        execute (msg, args)
        {
            const member = msg.guild.members.cache.find(m => m.id === args[0] || m.displayName === args[0]) ?? msg.mentions.members.first();
            if (!member)
                return msg.channel.sendEmbed("I can't find that member!");
            let blackList = JSON.parse(fs.readFileSync("./Utils/BlacklistedIDs.json", "utf-8").trim());
            blackList.push(member.id);
            fs.writeFileSync("./Utils/BlacklistedIDs.json", JSON.stringify(blackList));
            msg.channel.sendEmbed(`<@${member.id}> has been blacklisted from verifying.`);
        }
    }
}

module.exports = 
{
    name: "verification",
    description: "Sort out verification stuff",
    requireRole: "848304355592765460",
    execute(msg, args)
    {
        const commandName = args.shift();
        if (!commands[commandName])
            return msg.channel.sendEmbed("Whoops! That's not a command dumb dumb!");
        else
            commands[commandName].execute(msg, args);
    }
}
