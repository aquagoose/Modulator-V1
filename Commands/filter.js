const fs = require("fs");

const commands = 
{
    ignorechannel:
    {
        execute(msg, args)
        {
            let channels = JSON.parse(fs.readFileSync("./Utils/IgnoredChannels.json", "utf-8").trim());
            if (channels.indexOf(msg.channel.id) > -1)
                return msg.channel.sendEmbed("This channel has already been ignored!");
            channels.push(msg.channel.id);
            fs.writeFileSync("./Utils/IgnoredChannels.json", JSON.stringify(channels));
            msg.channel.sendEmbed("This channel is now exempt from the filter!");
        }
    },

    addinvite:
    {
        execute(msg, args)
        {
            let invites = JSON.parse(fs.readFileSync("./Utils/AllowedInviteIDs.json", "utf-8").trim());
            const inviteCode = args[0].substring(args[0].indexOf("discord.gg")).split("/")[1];
            if (invites.indexOf(inviteCode) > -1)
                return msg.channel.sendEmbed("This invite has already been added.");
            invites.push(inviteCode);
            fs.writeFileSync("./Utils/AllowedInviteIDs.json", JSON.stringify(invites));
        }
    }
}

module.exports = 
{
    name: "filter",
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