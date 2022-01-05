const Discord = require("discord.js");
const Utils = require("./Utils");
const fs = require("fs");

// Send an embed or a regular message, based on the guild's config.
// An extension method to the Discord.Channel prototype.
Object.defineProperty(Discord.Channel.prototype, "sendEmbed", {
    value: function sendEmbed(description, title, color, fields, footer, timestamp, author)
    {
        // Checks to see if embed response is true, or does not exist (embed response is enabled by default.)
        if (!color) color = Utils.generateColor();
        const embed =
            {
                title: title,
                description: description,
                color: color,
                fields: fields,
                footer: footer,
                timestamp: timestamp,
                author: author
            };
        return this.send({embed: embed});
    },
    writable: true,
    configurable: true
});

Object.defineProperty(Discord.User.prototype, "sendEmbed", {
    value: function sendEmbed(description, title, color, fields, footer, author)
    {
        // Checks to see if embed response is true, or does not exist (embed response is enabled by default.)
        if (!color) color = Utils.generateColor();
        const embed =
            {
                title: title,
                description: description,
                color: color,
                fields: fields,
                footer: footer
            };
        return this.send({embed: embed});
    },
    writable: true,
    configurable: true
});

Object.defineProperty(Discord.GuildMember.prototype, "saveData",
    {
        value: function saveData()
        {
            this.guild.memberDatas[this.id] = this.data;
            fs.writeFileSync("./Data/MemberData.json", JSON.stringify(this.guild.memberDatas));
        }
    })