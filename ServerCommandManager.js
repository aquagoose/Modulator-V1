const { serverprefix } = require("./config.json");

module.exports = 
{
    checkCommand(msg)
    {
        const splitMsg = msg.content.slice(2).split(":**");
        const user = splitMsg[0];
        const message = splitMsg[1].trim();
        
        if (!message.startsWith(serverprefix)) return;

        const args = message.slice(serverprefix.length).split(" ");
        const commandName = args.shift().trim();

        const command = msg.client.commands.get(commandName) || msg.client.commands.find(c => c.aliases && c.aliases.includes(commandName));
        if (!command) return msg.channel.send(`Hey, that's not a command!`);

        if (!command.serverOnly && !command.allowOnServer)
            return msg.channel.send("Sorry, that command cannot be used on the server!");

        msg.isServer = true;
        msg.serverAuthor = user;
        msg.serverMessage = message;

        try
        {
            command.execute(msg, args)
        }
        catch (e)
        {
            console.error(e);
        }
    }
}