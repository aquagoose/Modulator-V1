const fs = require("fs");

module.exports =
    {
        checkForBannedPhrasesAndSwears(msg)
        {
            const channels = JSON.parse(fs.readFileSync("./Utils/IgnoredChannels.json", "utf-8").trim());
            if (channels.indexOf(msg.channel.id) > -1)
                return;
            const phrases = JSON.parse(fs.readFileSync("./Utils/BannedPhrases.json", "utf-8").trim());
            phrases.forEach(p => 
            {
                if (msg.content.toLowerCase().includes(p))
                {
                    msg.delete();
                    msg.channel.send(`${msg.member}, please do not talk about potentially controversial topics on this server!`);
                }
            });

            if (msg.content.includes("discord.gg"))
            {
                let invStr = "";
                for(let i = msg.content.indexOf("discord.gg") + "discord.gg".length; i < msg.content.length; i++)
                {
                    if (msg.content[i] != "/")
                        invStr += msg.content[i];
                    if (msg.content[i] == " ")
                        break;
                }
                const invites = JSON.parse(fs.readFileSync("./Utils/AllowedInviteIDs.json", "utf-8").trim());
                if (invites.indexOf(invStr) < 0)
                {
                    msg.delete();
                    return msg.channel.send(`${msg.member}, advertising other servers/discord servers is disallowed. This has been logged.`);
                }
            }
        }
    }