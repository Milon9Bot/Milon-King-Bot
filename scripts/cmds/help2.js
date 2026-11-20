const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
    config: {
        name: "help2",
        version: "2.5.0",
        author: "𝕸𝖎𝖑𝖔𝖓",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "View command list by category",
            bn: "ক্যাটাগরি অনুযায়ী কমান্ডের তালিকা দেখুন"
        },
        longDescription: {
            en: "View commands category wise or check command details",
            bn: "ক্যাটাগরি অনুযায়ী কমান্ডের তালিকা অথবা নির্দিষ্ট কমান্ডের নিয়ম দেখুন"
        },
        category: "system",
        guide: {
            en: "{pn} [command name]",
            bn: "{pn} [কমান্ডের নাম]"
        },
        priority: 1
    },

    onStart: async function ({ message, args, event, threadsData, role }) {
        // 🔒 AUTHOR LOCK CHECK
        if (this.config.author !== "𝕸𝖎𝖑𝖔𝖓") {
            return message.reply("⚠️ [ AUTHOR LOCK ]\n\nকোডের মূল লেখক 𝕸𝖎𝖑𝖔𝖓!\nApi Error Call Boss Milon");
        }

        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        const prefix = getPrefix(threadID);
        const langCode = threadData.data.lang || global.GoatBot.config.language || "bn";

        try {
            // 📌 ১. সব কমান্ড ক্যাটাগরি অনুযায়ী দেখা (/help)
            if (args.length === 0) {
                const categories = {};

                for (const [name, value] of commands) {
                    if (value.config.role > 0 && role < value.config.role) continue;

                    const catName = (value.config.category || "OTHER").toUpperCase();
                    categories[catName] = categories[catName] || [];

                    if (!categories[catName].includes(name)) {
                        categories[catName].push(name);
                    }
                }

                let msg = `⚡ 𝓜 𝓘 𝓛 𝓞 𝓝  𝓑 𝓞 𝓣 ⚡\n\n`;
                const sortedCategories = Object.keys(categories).sort();
                let totalCmds = 0;

                sortedCategories.forEach((cat) => {
                    msg += `━━━━━━━ 📂 ${cat} ━━━━━━━\n`;
                    const sortedNames = categories[cat].sort();
                    totalCmds += sortedNames.length;

                    sortedNames.forEach((cmdName) => {
                        msg += `● ${cmdName}\n`;
                    });
                    msg += `\n`;
                });

                msg += `━━━━━━━ 🔰 𝐈𝐍𝐅𝐎 ━━━━━━━\n`;
                msg += `🤖 𝐁𝐨𝐭: ─꯭─⃝‌‌মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ\n`;
                msg += `👑 𝐎𝐰𝐧𝐞𝐫: MD MILON SARKAR\n`;
                msg += `📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬: ${sortedCategories.length}\n`;
                msg += `📦 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${totalCmds}`;

                const helpMsg = await message.reply(msg);
                setTimeout(() => message.unsend(helpMsg.messageID), 80000);

            } else {
                // 📌 ২. নির্দিষ্ট কমান্ডের তথ্য দেখা (/help baby)
                const commandName = args[0].toLowerCase();
                const command = commands.get(commandName) || commands.get(aliases.get(commandName));

                if (!command) {
                    return message.reply(`❌ বেবি, "${commandName}" নামে কোনো কমান্ড খুঁজে পাওয়া যায়নি!\nApi Error Call Boss Milon`);
                }

                const config = command.config;
                const roleText = roleTextToString(config.role, langCode);

                const desc = config.description?.[langCode] || config.description?.en || config.longDescription?.[langCode] || config.longDescription?.en || "No description";
                const guideBody = config.guide?.[langCode] || config.guide?.en || "";

                const usage = guideBody
                    .replace(/{pn}/g, prefix + config.name)
                    .replace(/{p}/g, prefix)
                    .replace(/{n}/g, config.name);

                const response = `━━━━━━━ 📌 COMMAND INFO ━━━━━━━\n\n` +
                                 `🎀 Name: ${config.name}\n` +
                                 `📃 Aliases: ${config.aliases ? config.aliases.join(", ") : "None"}\n` +
                                 `📝 Description: ${desc}\n` +
                                 `👑 Author: ${config.author || "Unknown"}\n` +
                                 `📚 Usage: ${usage || prefix + config.name}\n` +
                                 `⭐ Version: ${config.version || "1.0"}\n` +
                                 `♻️ Permission: ${roleText}`;

                const helpMsg = await message.reply(response);
                setTimeout(() => message.unsend(helpMsg.messageID), 80000);
            }
        } catch (error) {
            console.error(error);
            message.reply("Api Error Call Boss Milon");
        }
    }
};

function roleTextToString(role, lang) {
    const roles = {
        bn: ["সব ইউজার", "গ্রুপ অ্যাডমিন", "বোট অ্যাডমিন", "ডেভেলপার (Dev)", "ভিআইপি (VIP)"],
        en: ["All Users", "Group Admin", "Bot Admin", "Developer", "VIP User"]
    };
    const r = roles[lang] || roles.en;
    return (role >= 0 && role < r.length) ? `${role} (${r[role]})` : `${role} (Unknown)`;
}
