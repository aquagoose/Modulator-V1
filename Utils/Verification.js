const fs = require("fs");
const Utils = require("./Utils");

module.exports =
    {
        async createVerificationChannel(guild, member, sus = false)
        {
            if (Utils.isInMessageCollector(member)) return;
            if (this.isVerified(member)) return;
            //    return member.sendEmbed("You're already verified, silly! No need to verify twice!");
            let channel;
            let channels = guild.channels.cache.filter(c => c.parent?.id === "848982654841389077" && c.type === "text" && c.topic?.startsWith(member.id));
            if (channels.size === 0)
            {
                channel = await guild.channels.create("verify", {
                    topic: `${member.id} - Verify to get access to the server!`, parent: "848982654841389077"});
                await channel.lockPermissions();
                await channel.updateOverwrite(member, {VIEW_CHANNEL: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true});
            }
            else
                channel = channels.first();
            if (guild.memberDatas)
            {
                if (guild.memberDatas[member.id])
                {
                    if (guild.memberDatas[member.id]["sus"])
                        sus = true;
                }
            }
            await channel.send(`<@${member.id}>`);
            if (!sus)
                await channel.sendEmbed(`Hi there! Welcome to ${guild.name}! If you haven't done so already, read our <#848308878663483422>.\nOnce you're done, type \`!verify\` in this channel to begin the verification process.`, 
                    `Hey, ${member.displayName ?? member.username}!`);
            else
                await channel.sendEmbed(`Hey ${member.displayName ?? member.username}, a staff member has decided that you need to go through Stage 2 verification. Sorry for the inconvenience!\n\nBefore you start, please read the <#848308878663483422> again. Once you're ready, type \`!verify\` in chat. You have 5 minutes before it times out.`, 
                    `Stage 2 Verification.`);
        },
        
        isVerified(member)
        {
            const members = JSON.parse(fs.readFileSync("./Data/MemberData.json", "utf-8").trim());
            if (!members[member.id]) return false;
            return members[member.id]["verified"];
        }
    }