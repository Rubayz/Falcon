require("dotenv").config();

const Discord = require("discord.js");
const commando = require("discord.js-commando");
const oneLine = require("common-tags").oneLine;
const request = require("node-superfetch");
const axios = require("axios").default;

module.exports = class GoogleCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "google",
            aliases: [],
            group: "search",
            memberName: "google",
            description: "Google something here!",
            details: oneLine`
                Google something here!
            `,
            examples: ["!google <query>"],
            credit: [
                {
                    name: "Google",
                    url: "https://www.google.com/",
                    reason: "Custom Search API",
                    reasonURL: "https://cse.google.com/cse/all",
                },
                {
                    name: "LMGTFY",
                    url: "https://lmgtfy.com/",
                    reason: "API",
                },
            ],
            args: [
                {
                    key: "query",
                    prompt: "What would you like to search for?",
                    type: "string",
                    validate: (query) => {
                        if (encodeURIComponent(query).length < 1950)
                            return true;
                        return "Invalid query, your query is too long.";
                    },
                },
            ],
        });
    }

    /**
     * @param {commando.CommandoMessage} message
     */

    async run(message, { query }) {
        try {
            const options = {
                method: "GET",
                url: `https://google-search3.p.rapidapi.com/api/v1/search/q=${query}&lr=lang_en&cr=US&num=6`,
                headers: {
                    "x-rapidapi-key": process.env.API_KEY,
                    "x-rapidapi-host": "google-search3.p.rapidapi.com",
                },
            };

            axios
                .request(options)
                .then(function (response) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(
                            "Google",
                            "https://expresswriters.com/wp-content/uploads/2015/09/google-new-logo-450x450.jpg"
                        )
                        .setColor("#1183ed");

                    for (var i = 0; i < response.data.results.length; ++i) {
                        var result = response.data.results[i];

                        embed.addField(
                            `${result.title}`,
                            `[Link](${result.link}) - ${result.description}`
                        );
                    }

                    message.channel.send(embed);
                })
                .catch(function (error) {
                    console.error(error);
                });
        } catch (err) {
            console.error(err);
        }
    }
};
