const fs = require("fs");
const { applicationschannel } = require("../config.json");

const commands = 
{
    review:
    {
        description: "Review any application.",
        execute(msg, args)
        {
            const applications = JSON.parse(fs.readFileSync("./Data/Applications.json", "utf-8").trim());
            if (!applications[args[0]])
                return msg.channel.sendEmbed("Sorry, there doesn't appear to be an application with that ID.");
            let text = `Reviewing <@${args[0]}>'s application.\n\n`;
            for (const answer of applications[args[0]])
            {
                const tempText = `**__${answer.question}__**\n${answer.answer}\n\n`;
                if (text.length + tempText.length > 4096)
                {
                    msg.channel.sendEmbed(text);
                    text = "";
                }
                text += tempText;
            }
            msg.channel.sendEmbed(text);
        }
    },

    accept:
    {
        description: "Accept any application.",
        execute(msg, args)
        {
            const applications = JSON.parse(fs.readFileSync("./Data/Applications.json", "utf-8").trim());
            if (!applications[args[0]])
                return msg.channel.sendEmbed("Sorry, there doesn't appear to be an application with that ID.");
            let message = null;
            if (args[1])
                message = args.splice(1, args.length).join(" ");
            delete applications[args[0]];
            fs.writeFileSync("./Data/Applications.json", JSON.stringify(applications));
            const member = msg.guild.members.cache.get(args[0]);
            member.user.sendEmbed(`Your application was approved! Congratulations!${message ? `\n\nStaff comment: ${message}` : ""}`, "Application approved", 0x00FF00);
            msg.channel.sendEmbed(`<@${args[0]}>'s application was approved successfully.`, null, 0x00FF00);
        }
    },

    deny:
    {
        description: "Deny any application.",
        execute(msg, args)
        {
            const applications = JSON.parse(fs.readFileSync("./Data/Applications.json", "utf-8").trim());
            if (!applications[args[0]])
                return msg.channel.sendEmbed("Sorry, there doesn't appear to be an application with that ID.");
            let message = null;
            if (args[1])
                message = args.splice(1, args.length).join(" ");
            delete applications[args[0]];
            fs.writeFileSync("./Data/Applications.json", JSON.stringify(applications));
            const member = msg.guild.members.cache.get(args[0]);
            member.user.sendEmbed(`Your application was denied.${message ? `\n\nStaff comment: ${message}` : ""}`, "Application denied", 0xFF0000);
            msg.channel.sendEmbed(`<@${args[0]}>'s application was denied successfully.`, null, 0x00FF00);
        }
    },

    queue:
    {
        description: "See if any applications are waiting.",
        execute(msg)
        {
            const applications = JSON.parse(fs.readFileSync("./Data/Applications.json", "utf-8").trim());
            let keys = "";
            for (const key in applications)
            {
                keys += key + "\n";
            }
            if (keys.length === 0)
                msg.channel.sendEmbed("There are no applications in the queue.", "Applications queue");
            else
                msg.channel.sendEmbed(`The following applications are available:\n\n${keys}\n\nType \`${msg.guild.prefix}application review <ID>\` to review an application.`, "Applications queue");
        }
    }
}

module.exports = 
{
    name: "application",
    description: "Deal with server applications.",
    requireRole: "848304228769464320",
    execute(msg, args)
    {
        const commandName = args.shift();
        if (!commands[commandName])
            return msg.channel.sendEmbed("Whoops! That's not a command dumb dumb!");
        else
            commands[commandName].execute(msg, args);
    }
}