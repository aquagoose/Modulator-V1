module.exports = 
{
    name: "getnotified",
    description: "Get notified of future server updates!",
    execute(msg, args)
    {
        msg.member.roles.add("850787023950053446");
        msg.channel.sendEmbed("All done! You will now be notified of future updates!", null, 0x00FF00);
    }
}