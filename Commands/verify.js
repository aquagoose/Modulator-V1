const Discord = require("discord.js");
const http = require("https");
const { generalchannel, servercommandschannel, staffchannel } = require("../config.json");
const Utils = require("../Utils/Utils");
const Verification = require("../Utils/Verification");
const fs = require("fs");

const questions = 
[
    {
        question: "Why did I remove the questions?",
        answers: ["To prevent you from cheating!", "Because I'm mean", "Why not", "hello"],
        answer: 0
    }
];

function susVerify(msg)
{
    if (msg.member.roles.cache.get("851119566661877800"))
        return msg.channel.sendEmbed("Sorry. You did not answer 1 or more of the questions correctly. You must now wait for a staff member to choose to either verify you, or deny you.");
    let askedQuestions = [];
    let askedQuestionIndexes = [];
    const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id, { idle: 300000 });
    Utils.setInMessageCollector(msg.member);

    msg.member.roles.add("851119566661877800");

    const numOfQuestions = 3;
    let questionsAsked = 1;

    let currentQuestion = Math.floor(Math.random() * questions.length);
    askedQuestionIndexes.push(currentQuestion);

    let question = questions[currentQuestion].question + "\n";

    let correctAnswers = 0;

    let currentAnsNum = 0;
    for (const answer of questions[currentQuestion].answers)
    {
        currentAnsNum++;
        question += `${currentAnsNum}) ${answer}\n`;
    }
    
    msg.channel.sendEmbed(`Okay. We're going to ask you ${numOfQuestions} questions, and assuming you answer them all correctly, you'll be free to pass. If you do not answer them all correctly, you may be held back for manual verification.\n\n${question}\n**Enter the correct answer by typing its number (like \`1\` for example).**`);

    collector.on("collect", async (m) =>
    {
        if (isNaN(m.content))
            return msg.channel.sendEmbed("Please enter a number for an answer. If you think the correct answer is answer 1 for example, just type `1`.");
        if (parseInt(m.content) - 1 === questions[currentQuestion].answer)
            correctAnswers++;
        askedQuestions.push({question: question, personAnswer: m.content, correctAnswer: questions[currentQuestion].answer + 1});
        if (questionsAsked >= numOfQuestions)
        {
            if (correctAnswers == numOfQuestions)
                collector.stop("good");
            else
                collector.stop("bad");
            return;
        }
        if (questionsAsked < numOfQuestions)
        {
            currentQuestion = Math.floor(Math.random() * questions.length);
            while (askedQuestionIndexes.indexOf(currentQuestion) > -1)
                currentQuestion = Math.floor(Math.random() * questions.length);
            askedQuestionIndexes.push(currentQuestion);
            question = questions[currentQuestion].question + "\n";
            currentAnsNum = 0;
            for (const answer of questions[currentQuestion].answers)
            {
                currentAnsNum++;
                question += `${currentAnsNum}) ${answer}\n`;
            }
            questionsAsked++;
            msg.channel.sendEmbed(`${question}\n**Enter the correct answer by typing its number (like \`1\` for example).**`);
        }
    });

    collector.on("end", async (collected, reason) =>
    {
        Utils.removeFromMessageCollector(msg.member);
        const staffChannel = msg.guild.channels.cache.get(staffchannel);
        if (reason === "good")
        {
            msg.member.data["verified"] = true;
            delete msg.member.data["sus"];
            msg.member.saveData();
            msg.guild.channels.cache.get(servercommandschannel).send(`;;!whitelist add ${msg.member.data["steam-id"]}`);
            msg.member.roles.remove("851119566661877800");
            msg.member.roles.add("848976638442995773");
            msg.channel.sendEmbed("Thanks for completing this double-verification. You've answered each question correctly! Please feel free to carry on.\n\nThis channel will go boom in 10 seconds...");
            
            let fields = [];
            let i = 0;
            askedQuestions.forEach(q =>
            {
                i++;
                fields.push({name: `Question ${i}`, value: `__Question__\n${q.question}\nCorrect answer: ${q.correctAnswer}\nUser answered: ${q.personAnswer}`});
            });

            staffChannel.sendEmbed(`<@${msg.member.id}> (ID: ${msg.member.id}) has **passed** stage 2 verification.`, `${msg.member.displayName} passed Stage 2 verification`, null, fields, null, new Date());
            
            await new Promise(resolve => setTimeout(resolve, 10000));
            msg.channel.delete();
        }
        else if (reason === "bad")
        {
            msg.channel.sendEmbed("Sorry. You did not answer 1 or more of the questions correctly. You must now wait for a staff member to choose to either verify you, or deny you.");

            let fields = [];
            let i = 0;
            askedQuestions.forEach(q =>
            {
                i++;
                fields.push({name: `Question ${i}`, value: `__Question__\n${q.question}\nCorrect answer: ${q.correctAnswer}\nUser answered: ${q.personAnswer}`});
            });

            staffChannel.sendEmbed(`<@${msg.member.id}> (ID: ${msg.member.id}) has **failed** stage 2 verification and requires manual staff intervention. Please review these and make a judgement for yourself.`, `${msg.member.displayName} failed Stage 2 verification`, null, fields, null, new Date());
        }
    })
}

module.exports =
    {
        name: "verify",
        description: "Get verified to access the server.",
        execute(msg, args)
        {
            if (Verification.isVerified(msg.member))
                return msg.channel.sendEmbed("You're already verified, silly! No need to verify twice!");
            if (Utils.isInMessageCollector(msg.member))
                return;
            if (msg.member.roles.cache.get("850712538299105310"))
                return msg.channel.sendEmbed("Sorry, you've been flagged as suspicious either by the AltDentifier or by a member of staff. You cannot progress with verification until you successfully pass the AltDentifier's online verification. This is just to keep the server safe, and away from trollers/raiders. Thanks for your co-operation!");
            const blackList = JSON.parse(fs.readFileSync("./Utils/BlacklistedIDs.json", "utf-8").trim());
            if (blackList.includes(msg.author.id))
                return msg.author.sendEmbed("Sorry, something went wrong :/");
            if (msg.member.data["sus"])
                return susVerify(msg);
            let stage = 0;
            let chosenQuestion = 0;
            let steamID = "";
    
            const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id, { idle: 300000 });
            Utils.setInMessageCollector(msg.member);
            
            msg.channel.sendEmbed(`Alright! I'm just gonna ask a couple of questions and then you'll be all set. If you need help at any time, please feel free to ping <@&848304355592765460>. **This will expire after 5 minutes of inactivity.** If it expires, just type \`!verify\` again to get started at any time!\n\nWhat is your Steam ID? You can find it by going to https://steamid.io/\n**Unsure of how to find your Steam ID?** View this short guide here: http://bit.ly/ehsteamid`);
            
            let askedQuestions = [];

            collector.on("collect", async (m) =>
            {
                switch (stage)
                {
                    case 0:
                    {
                        const id = await this.getValidID(m.content);
                        if (!id["status"])
                            msg.channel.sendEmbed("Hmm.. That doesn't seem to be a valid steam ID. We need your ID to add you to the server whitelist! Please check it. You can find it by going to https://steamid.io/");
                        else
                        {
                            steamID = id["id"];
                            console.log(steamID);
                            stage = 1;
                            msg.channel.sendEmbed("Awesome! We've got that all sorted.\n\nWhat is the rule number? You can find this in the rules, if you haven't already. **It is not written as a number, it is written as plain text! However, please write it as a number here. (Or it won't be accepted)**");
                        }
                        break;
                    }
                    case 1:
                    {
                        if (m.content !== "1234")
                            msg.channel.sendEmbed("Whoops! That's not the correct number! Make sure you read the rules thoroughly. You'll find it in there if you look hard enough! (**Make sure you enter a number, and not text.**)");
                        else
                        {
                            stage = 2;
                            chosenQuestion = Math.floor(Math.random() * questions.length);
                            let question = questions[chosenQuestion].question + "\n";
                            let currentAnsNum = 0;
                            for (const answer of questions[chosenQuestion].answers)
                            {
                                currentAnsNum++;
                                question += `${currentAnsNum}) ${answer}\n`;
                            }
                            msg.channel.sendEmbed(`Great! Just one last question, and you're done.\n\n${question}\n**Enter the correct answer by typing its number (like \`1\` for example).**`);
                        }
                        break;
                    }
                    case 2:
                    {
                        if (parseInt(m.content) - 1 === questions[chosenQuestion].answer)
                            collector.stop("done");
                        else if (isNaN(m.content))
                            return msg.channel.sendEmbed("Please enter a number for an answer. If you think the correct answer is answer 1 for example, just type `1`.");
                        else
                            msg.channel.sendEmbed("Hmm, that's not the right answer. Give it another go.");
                    }
                }
            });
            
            collector.on("end", async (collected, reason) => 
            {
                Utils.removeFromMessageCollector(msg.member);
                if (reason === "idle")
                    msg.channel.sendEmbed("Hey, this has timed out because you were inactive for more than 5 minutes. But not to worry! Just type `!verify` to start the verification process again.");
                if (reason === "done")
                {
                    msg.member.data["verified"] = true;
                    msg.member.data["steam-id"] = steamID;
                    msg.member.saveData();
                    msg.guild.channels.cache.get(servercommandschannel).send(`;;!whitelist add ${steamID}`);
                    msg.member.roles.add("848976638442995773");
                    msg.channel.sendEmbed("And that's it! You now have full access to the server! Thanks for spending the time to make this server a better place!\n\nThis channel will go boom in 10 seconds...");
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    //let fields = [];
                    //let i = 0;
                    //askedQuestions.forEach(q =>
                    //{
                    //    i++;
                    //    fields.push({name: `Question ${i}`, value: `__Question__\n${q.question}\nCorrect answer: ${q.correctAnswer}\nUser answered: ${q.personAnswer}`});
                    //});

                    //staffChannel.sendEmbed(`<@${msg.member.id}> (ID: ${msg.member.id}) has **passed** verification.`, `${msg.member.displayName} passed verification`, null, fields, null, new Date());
                    
                    msg.channel.delete();
                    msg.guild.channels.cache.get(generalchannel).send(`Everyone welcome ${msg.member} to ${msg.guild.name}! You can find the server IP in <#849230273317306388>!`);
                }
            })
        },
        
        async getValidID(id)
        {
            let options =
                {
                    host: "eh.ollierobinson.co.uk",
                    path: `/steamid.php?id=${id}`
                };
            return new Promise(((resolve, reject) => 
            {
                http.get(options, (res) =>
                {
                    let data = "";
                    res.on("data", (chunk) =>
                    {
                        data += chunk;
                    });

                    res.on("end", () =>
                    {
                        resolve(JSON.parse(data));
                    });
                }); 
            }))
        }
    }
