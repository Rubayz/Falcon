require("dotenv").config();

const { CommandoClient } = require("discord.js-commando");
const path = require("path");
const Canvas = require("discord-canvas");
const { ReactionRoleManager } = require("discord.js-collector");

const client = new CommandoClient({
    commandPrefix: process.env.PREFIX,
    owner: "548038495617417226",
    autoReconnect: true,
    partials: [
        "MESSAGE",
        "CHANNEL",
        "GUILD_MEMBER",
        "REACTION",
        "MESSAGE",
        "USER",
    ],
});

const reactionRoleManager = new ReactionRoleManager(client, {
    mongoDbLink: process.env.MONGO_PATH, // See here to see how setup mongoose: https://github.com/IDjinn/Discord.js-Collector/blob/master/examples/reaction-role-manager/Note.md
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ["general", "General Command Group"],
        ["games", "Games from CodeVert"],
        ["moderation", "Moderators group"],
        ["music", "Music Commands Group"],
        ["events", "Events from CodeVert"],
        ["notify", "Notify devs about Bugs and Features"],
        ["nsfw", "NSFW Content Group"],
        ["misc", "Miscellanious Commands"],
        ["fun", "Fun Commands from CodeVert"],
        ["search", "Search anything from CodeVert"],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: false,
        ping: false,
        prefix: true,
        commandState: true,
        unknownCommand: false,
    })
    .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
    console.log(`[READY] Logged in as ${client.user.tag}!`);
});

// Triggered when the bot doesn't have permissions to manage this role.
reactionRoleManager.on(
    "missingPermissions",
    (action, member, roles, reactionRole) => {
        console.log(
            `Some roles cannot be ${
                action === 1 ? "given" : "taken"
            } to member \`${
                member.displayName
            }\`, because i don't have permissions to manage these roles: ${roles
                .map((role) => `\`${role.name}\``)
                .join(",")}`
        );
    }
);

client.on("message", async (message) => {
    const client = message.client;
    const args = message.content.split(" ").slice(1);
    // Example
    // >createReactionRole @role :emoji: MessageId
    if (message.content.startsWith("!createRR")) {
        const role = message.mentions.roles.first();
        if (!role)
            return message
                .reply("You need mention a role")
                .then((m) => m.delete({ timeout: 1000 }));

        const emoji = args[1];
        if (!emoji)
            return message
                .reply("You need use a valid emoji.")
                .then((m) => m.delete({ timeout: 1000 }));

        const msg = await message.channel.messages.fetch(args[2] || message.id);
        if (!role)
            return message
                .reply("Message not found! Wtf...")
                .then((m) => m.delete({ timeout: 1000 }));

        reactionRoleManager.createReactionRole({
            message: msg,
            roles: [role],
            emoji,
            type: 1,
        });
        /**
         * Reaction Role Type
         * NORMAL [1] - This role works like basic reaction role.
         * TOGGLE [2] - You can win only one role of all toggle roles in this message (like colors system)
         * JUST_WIN [3] - This role you'll only win, not lose.
         * JUST_LOSE [4] - This role you'll only lose, not win.
         * REVERSED [5] - This is reversed role. When react, you'll lose it, when you take off reaction you'll win it.
         */

        message.reply("Done").then((m) => m.delete({ timeout: 500 }));
    } else if (message.content.startsWith("!deleteRR")) {
        const emoji = args[0];
        if (!emoji)
            return message
                .reply("You need use a valid emoji.")
                .then((m) => m.delete({ timeout: 1000 }));

        const msg = await message.channel.messages.fetch(args[1]);
        if (!msg)
            return message
                .reply("Message not found! Wtf...")
                .then((m) => m.delete({ timeout: 1000 }));

        await reactionRoleManager.deleteReactionRole({ message: msg, emoji });
    }
});

client.on("error", console.error);

client.login(process.env.TOKEN);
