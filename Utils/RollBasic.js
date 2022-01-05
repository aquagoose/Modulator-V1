const functions = 
{
    send(args)
    {
        return `msg.channel.send(${stringParser(args.join(" "))})`;
    },

    
}

module.exports = 
{
    runFromString(code, msg)
    {
        let program = code.split("\n");
        runProgram(program, msg);
    }
}

function stringParser(string)
{
    console.log(string.split('"'));
}

function runProgram(program, msg)
{
    let outputJS = "";
    program.forEach(l =>
    {
        const operands = l.split(" ");
        const opcode = operands.shift();
        if (!functions[opcode])
        {
            if (operands[1] == "=")
            {
                outputJS += `let ${operands[0]} = ${stringParser(operands.splice(2, operands.length - 2).join(" "))}`;
            }
        }
        outputJS += functions[opcode](operands) + "\n";
    });

    eval(outputJS);
}