module.exports = 
{
    name: "getsteamid",
    description: "Get the Steam ID of a specific member.",
    requireRole: "848304355592765460",
    args: 1,
    execute(msg, args)
    {
        const id = args.join(" ");
        const member = msg.guild.members.cache.find(m => m.displayName === id || m.id === id) ?? msg.mentions.members.first();
        if (!member)
            return msg.channel.sendEmbed("I can't find that member.", null, 0xFF0000);
        
        memberInfo = msg.guild.memberDatas[member.id];
        if (!memberInfo["steam-id"])
            return msg.channel.sendEmbed("That user doesn't appear to have a Steam ID. Hmm...", null, 0xFF0000);
        msg.channel.sendEmbed(`**${member.displayName}**'s Steam ID is **${memberInfo["steam-id"]}**`);
    }
}