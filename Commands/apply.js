const Utils = require("../Utils/Utils");
const { applicationschannel } = require("../config.json");
const fs = require("fs");

module.exports = 
{
    name: "apply",
    description: "Apply for certain roles within the server.",
    usage: "<staff/council>",
    args: 1,
    async execute(msg, args)
    {
        const givenType = args[0]?.toLowerCase() ?? "";

        const questions = 
        {
            council:
            [
                {
                    question: "What is your name?",
                    remark: "Make sure this is your in-game name as displayed in Space Engineers. You can include your real name if you'd like, but we don't need it."
                },

                {
                    question: "How old are you?"
                },

                {
                    question: "Why would you like to join the council?"
                },

                {
                    question: "How do you think you can help the server? What can you bring to the table?",
                    remark: "Remember - you will be helping us make decisions, and even important ones. Spend the time to think about your answer. We will decline weak applications!"
                },

                {
                    question: "Any other things to note?"
                }
            ],

            staff:
            [
                {
                    question: "What is your name?",
                    remark: "Make sure this is your in-game name as displayed in Space Engineers. You can include your real name if you'd like, but we don't need it."
                },

                {
                    question: "How old are you?"
                },

                {
                    question: "How many hours do you have in Space Engineers?"
                },

                {
                    question: "How much experience do you have moderating?",
                    remark: "Be honest. If you have none, let us know! We won't deny you just because you have no experience!"
                },

                {
                    question: "Why would you like to join staff?"
                },

                {
                    question: "How do you think you can help the server? What can you bring to the table?",
                    remark: "Remember - you will be moderating the server, and even help us make decisions. Spend the time to think about your answer. We will decline weak applications!"
                },

                {
                    question: "Any other things to note?"
                }
            ],

            beta:
            [
                {
                    question: "What is your name?",
                    remark: "Make sure this is your in-game name as displayed in Space Engineers. You can include your real name if you'd like, but we don't need it."
                },

                {
                    question: "How old are you?"
                },

                {
                    question: "What will make you a good beta tester?",
                    remark: "Answer this question as honestly as possible. We need good beta testers, so make sure you make yourself look good!"
                },

                {
                    question: "Any other things to note?"
                }
            ]
        };

        if (!questions[givenType])
            return msg.channel.sendEmbed(`Please choose \`staff\`, \`council\`, or \`beta\` as your application category! Type \`${msg.guild.prefix}${this.name} staff\` to apply for staff, \`${msg.guild.prefix}${this.name} council\` to apply for council, or \`${msg.guild.prefix}${this.name} beta\` to apply for beta.`);

        let applications = JSON.parse(fs.readFileSync("./Data/Applications.json", "utf-8").trim());
        if (applications[msg.member.id])
            return msg.author.sendEmbed("Sorry, you've already submitted an application that is awaiting approval. You cannot submit another application until your application is either accepted or denied.");

        const message = await msg.author.sendEmbed("Please answer this honestly and don't rush your answers. Weak applications will be declined!\n\nIf you are idle for longer than 10 minutes, the application will automatically be cancelled.\nType `cancel` at any time to cancel your application.", `Apply for ${givenType}.`);

        Utils.setInMessageCollector(msg.member);
        const collector = message.channel.createMessageCollector(m => m.author.id === msg.author.id, { idle: 600000 });

        let currentQuestion = 0;

        sendQuestionMessage(message, questions[givenType], currentQuestion);

        let answers = [];

        collector.on("collect", (mesg) =>
        {
            if (mesg.content.toLowerCase() === "cancel")
                return collector.stop("cancelled");
            answers.push({
                question: questions[givenType][currentQuestion].question,
                answer: mesg.content
            });
            if (currentQuestion === questions[givenType].length - 1)
                return collector.stop("done");
            currentQuestion++;
            sendQuestionMessage(message, questions[givenType], currentQuestion);
        });

        collector.on("end", (collected, reason) =>
        {
            Utils.removeFromMessageCollector(msg.member);
            if (reason === "done")
                message.channel.sendEmbed("All done! Thanks for applying! We'll get back to you as soon as we can.\nPlease note, you can't apply again until we've accepted or denied your application.", "All done!");
            else if (reason === "idle")
                return message.channel.sendEmbed("Whoops, you were idle for more than 10 minutes, so this application has timed out.", "Timed out");
            else if (reason === "cancelled")
                return message.channel.sendEmbed("You cancelled your application. Feel free to start the application process again at any time!");

            applications = JSON.parse(fs.readFileSync("./Data/Applications.json", "utf-8").trim());
            applications[msg.member.id] = answers;
            fs.writeFileSync("./Data/Applications.json", JSON.stringify(applications));

            const applicationsChannel = msg.guild.channels.cache.get(applicationschannel);
            applicationsChannel.sendEmbed(`A new ${givenType} application from <@${msg.member.id}> has been submitted!\n\nType \`${msg.guild.prefix}application review ${msg.member.id}\` to view this application.`, `${givenType[0].toUpperCase() + givenType.substring(1, givenType.length)} application submitted!`, null, 
            [
                {
                    name: "Username",
                    value: msg.author.username,
                    inline: true
                },
                {
                    name: "ID",
                    value: msg.member.id,
                    inline: true
                }
            ], null, new Date(), {name: msg.author.username + msg.author.discriminator, icon_url: msg.author.displayAvatarURL()});
        })
    }
}

function sendQuestionMessage(ctx, questions, questionNum)
{
    ctx.channel.sendEmbed(questions[questionNum].remark, questions[questionNum].question);
}