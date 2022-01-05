const RollBasic = require("../Utils/RollBasic");

module.exports = 
{
    name: "run",
    execute(msg, args)
    {
        RollBasic.runFromString(args.join(" "), msg);
    }
}