module.exports = 
{
    name: "staff",
    serverOnly: true,
    execute(msg, args)
    {
        msg.channel.send(`<@&848304355592765460>, you have been summoned by ${msg.serverAuthor}!`);
    }
}