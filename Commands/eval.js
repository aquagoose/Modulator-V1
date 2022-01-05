module.exports = 
{
    name: "eval",
    description: "Yes",
    requireRole: "848304355592765460",
    execute(msg, args)
    {
        const message = msg;
        const clean = text =>
        {
            if (typeof(text) === "string")
                return text.replace("/`/g", "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        }
        
        const code = args.join(" ");
        try
        {
            let evaled = eval(code);
            if (typeof(evaled) !== "string")
                evaled = require("util").inspect(evaled);
        }
        catch (e)
        {
            msg.channel.sendEmbed(clean(e).toString(), 0xFF0000, "Error");
        }
    }
}