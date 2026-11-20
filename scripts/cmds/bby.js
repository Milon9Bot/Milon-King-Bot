const axios = require("axios");

const mahmud = [
"baby",
"bby",
"babu",
"bbu",
"jan",
"bot",
"জান",
"জানু",
"বেবি",
"milon",
"nusrat",
"jui",
];

const baseApiUrl = async () => {
const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
return base.data.mahmud;
};

module.exports.config = {
name: "baby",
aliases: ["bby", "bbu", "jan", "janu", "milon", "bot", "nusrat", "jui"],
version: "7.0.8",
author: "MahMUD",
countDown: 0,
role: 0,
description: "better than all sim simi and most fastest",
category: "chat",
guide: {
en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach amar [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nremove [YourMessage] - [indexNumber] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nresponse [YourResponse] OR\nlist [all / pageNumber] OR\nedit [YourMessage] - [NeWMessage]\nNote: better than all sim simi and most fastest"
}
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
if (module.exports.config.author !== obfuscatedAuthor) {
return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
}

const rawMsg = args.join(" "); 
const mahmudQuery = rawMsg.toLowerCase(); 
const uid = event.senderID; 

try { 
    if (!args[0]) { 
        const ran = ["Bolo baby", "I love you", "type !bby hi"]; 
        return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID); 
    } 

    if (args[0] === "teach" && args[1] === "amar") {
        const content = rawMsg.replace(/^teach\s+amar\s+/i, "");
        const [question, ...responsesArr] = content.split(" - ");
        const responses = responsesArr.join(" - ");
        if (!question || !responses) return api.sendMessage("❌ | teach amar [question] - [response1, response2,...]", event.threadID, event.messageID);
        await axios.post(`${await baseApiUrl()}/api/teach?question=${encodeURIComponent(question)}&responses=${encodeURIComponent(responses)}&senderID=${encodeURIComponent(uid)}&key=intro`);
        return api.sendMessage(`✅ Intro reply added: "${responses}" to "${question}"`, event.threadID, event.messageID);
    }

    if (args[0] === "teach") { 
        const content = rawMsg.replace(/^teach\s+/i, ""); 
        const [question, ...responsesArr] = content.split(" - "); 
        const responses = responsesArr.join(" - "); 
        if (!question || !responses) return api.sendMessage("❌ | teach [question] - [response1, response2,...]", event.threadID, event.messageID); 
        const response = await axios.post(`${await baseApiUrl()}/api/teach?question=${encodeURIComponent(question)}&responses=${encodeURIComponent(responses)}&senderID=${encodeURIComponent(uid)}`); 
        const userName = (await usersData.getName(parseInt(uid, 10))) || "Unknown User"; 
        return api.sendMessage(`✅ Replies added: "${responses}" to "${question}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID); 
    } 

    if (args[0] === "remove" || args[0] === "rm") { 
        const content = rawMsg.replace(/^(remove|rm)\s+/i, ""); 
        const [question, index] = content.split(" - "); 
        if (!question || !index || isNaN(index)) return api.sendMessage("❌ | remove [question] - [index]", event.threadID, event.messageID); 
        const response = await axios.delete(`${await baseApiUrl()}/api/teach/remove?question=${encodeURIComponent(question)}&index=${encodeURIComponent(index)}&senderID=${encodeURIComponent(uid)}`); 
        return api.sendMessage(response.data.message, event.threadID, event.messageID); 
    } 

    if (args[0] === "list") { 
        const isAll = args[1] === "all" || !isNaN(args[1]); 
        const endpoint = isAll ? "/list/all" : "/list"; 
        const response = await axios.get(`${await baseApiUrl()}/api/teach${endpoint}`); 
        if (!isAll) return api.sendMessage(response.data.message, event.threadID, event.messageID); 
        let page = parseInt(!isNaN(args[1]) ? args[1] : args[2], 10) || 1; 
        const limit = 100; 
        const rawData = response.data.data; 
        const teachers = []; 
        for (const userID of Object.keys(rawData)) { 
            let name = "Unknown"; 
            try { 
                name = (await usersData.getName(parseInt(userID, 10))) || "Unknown"; 
            } catch (e) { 
                console.error(`getName failed for userID ${userID}:`, e.message); 
            } 
            teachers.push({ name, value: rawData[userID] }); 
        } 
        teachers.sort((a, b) => b.value - a.value); 
        const totalPages = Math.ceil(teachers.length / limit) || 1; 
        if (page < 1) page = 1; 
        if (page > totalPages) page = totalPages; 
        const start = (page - 1) * limit; 
        const paginatedData = teachers.slice(start, start + limit); 
        let message = "👑 List of Baby teachers:\n\n"; 
        for (let i = 0; i < paginatedData.length; i++) { 
            const t = paginatedData[i]; 
            const num = String(start + i + 1).padEnd(3); 
            message += `${num}. ${t.name}: ${t.value}\n`; 
        } 
        message += `\n• Total page: [${page}/${totalPages}]`; 
        message += `\n• Total Teacher: ${teachers.length}`; 
        message += `\n• type !baby list all ${page < totalPages ? page + 1 : page} and see next page`; 
        return api.sendMessage(message, event.threadID, event.messageID); 
    } 

    if (args[0] === "edit") { 
        const content = rawMsg.replace(/^edit\s+/i, ""); 
        const [oldResponse, ...newArr] = content.split(" - "); 
        const newResponse = newArr.join(" - "); 
        if (!oldResponse || !newResponse) return api.sendMessage("❌ | Format: edit [question] - [newResponse]", event.threadID, event.messageID); 
        const response = await axios.put(`${await baseApiUrl()}/api/teach/edit?oldResponse=${encodeURIComponent(oldResponse)}&newResponse=${encodeURIComponent(newResponse)}&senderID=${encodeURIComponent(uid)}`); 
        return api.sendMessage(response.data.message, event.threadID, event.messageID); 
    } 

    if (args[0] === "message" || args[0] === "msg") { 
        let searchMessage = args.slice(1).join(" "); 
        if (!searchMessage) return api.sendMessage("Please provide a message to search.", event.threadID, event.messageID); 
        try { 
            const response = await axios.get(`${await baseApiUrl()}/api/teach/message?search=${encodeURIComponent(searchMessage)}&senderID=${encodeURIComponent(uid)}`); 
            return api.sendMessage(response.data.message || "No message found.", event.threadID, event.messageID); 
        } catch (error) { 
            const errorMessage = error.response?.data?.error || error.message || "error"; 
            return api.sendMessage(errorMessage, event.threadID, event.messageID); 
        } 
    } 

    if (args[0] === "response") {
        const searchResponse = args.slice(1).join(" ");
        if (!searchResponse) return api.sendMessage("❌ Please provide a response to search.\nExample: bby response hi", event.threadID, event.messageID); 
        try {
            const response = await axios.get(`${await baseApiUrl()}/api/teach/response?search=${encodeURIComponent(searchResponse)}&senderID=${encodeURIComponent(uid)}`);
            return api.sendMessage(response.data.message || "No result found.", event.threadID, event.messageID);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "❌ Not found!";
            return api.sendMessage(errorMessage, event.threadID, event.messageID);
        }
    }

    const attachments = event.attachments || []; 
    const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(mahmudQuery)}&font=3&senderID=${encodeURIComponent(uid)}`, { attachments })).data.reply; 
    return api.sendMessage(response, event.threadID, (err, info) => { 
        if (!err) { 
            global.GoatBot.onReply.set(info.messageID, { commandName: module.exports.config.name, type: "reply", messageID: info.messageID, author: event.senderID, text: response }); 
        } 
    }, event.messageID); 

} catch (err) { 
    console.error(err); 
    api.sendMessage(`${err.response?.data || err.message}`, event.threadID, event.messageID); 
} 
};

module.exports.onReply = async ({ api, event }) => {
if (event.type !== "message_reply") return;
try {
    const text = event.body?.toLowerCase() || "";
    const attachments = event.attachments || [];
    const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(text)}&font=3&senderID=${encodeURIComponent(event.senderID)}`, { attachments })).data.reply;

    api.sendMessage(response, event.threadID, (err, info) => { 
        if (!err) { 
            global.GoatBot.onReply.set(info.messageID, { commandName: module.exports.config.name, type: "reply", messageID: info.messageID, author: event.senderID, text: response }); 
        } 
    }, event.messageID); 
} catch (err) { 
    console.error(err); 
} 
};

module.exports.onChat = async ({ api, event }) => {
try {
    const body = event.body ? event.body.toLowerCase() : "";
    const hasTrigger = mahmud.some(word => body.startsWith(word));

    if (event.type !== "message_reply" && hasTrigger) { 
        api.setMessageReaction("🪽", event.messageID, () => {}, true); 
        const text = body.replace(/^\S+\s*/, ""); 
        const attachments = event.attachments || []; 
        const randomMessage = [
            "বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
            "শুনবো না😼 তুমি আমার বস মিলন কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
            "আমি আবাল দের সাথে কথা বলি না,ok😒",
            "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
            "Bolo Babu, তুমি কি আমার বস মিলন কে ভালোবাসো? 🙈💋",
            "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
            "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
            "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
            "I love you janu🥰",
            "আরে Bolo আমার জান ,কেমন আছো?😚",
            "আজ বট বলে অসম্মান করছিস,😰😿",
            "Hop beda😾,Boss বল boss😼",
            "চুপ থাক ,নাই তো তোর দাঁত ভেঙ্গে দিবো কিন্তু",
            "আমাকে না ডেকে মেয়ে হলে বস মিলনের ইনবক্সে চলে যা 🌚😂 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://fb.com/61593943674779",
            "আমাকে বট না বলে , বস মিলন কে জানু বল জানু 😘",
            "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
            "আরে বলদ এতো ডাকিস কেন🤬",
            "আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘",
            "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
            "হ্যাঁ জানু , এইদিক এ আসো কিস দেই🤭 😘",
            "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
            "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
            "আমাকে ডেকো না,আমি বস মিলনে সাথে ব্যাস্ত আছি",
            "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
            "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
            "জান মেয়ে হলে বস মিলনের ইনবক্সে চলে যাও 😍🫣💕 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://fb.com/61593943674779",
            "কালকে দেখা করিস তো একটু 😈",
            "হা বলো, শুনছি আমি 😏",
            "আর কত বার ডাকবি ,শুনছি তো",
            "হুম বলো কি বলবে😒",
            "বলো কি করতে পারি তোমার জন্য",
            "আমি তো অন্ধ কিছু দেখি না🐸 😎",
            "আরে বোকা বট না জানু বল জানু😌",
            "বলো জানু 🌚",
            "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
            "হুম জান তোর নানীরে উম্মাহ 😑😘",
            "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
            "jang hanga korba😒😬",
            "হুম জান তোমারে উম্মমাহ😷😘",
            "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
            "ভালোবাসার নামক আবলামি করতে চাইলে বস মিলনের ইনবক্সে গুতা দিন ~🙊😘🤣 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://fb.com/61593943674779",
            "আমাকে এতো না ডেকে বস মিলন কে একটা গফ দে 🙄",
            "আমাকে এতো না ডাকতেছো কেন ভালো টালো বাসো নাকি🤭🙈",
            "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
            "আমি এখন বস মিলন এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
            "আমাকে না ডেকে আমার বস মিলন কে একটা জি এফ দাও-😽🫶🌺",
            "ঝাং থুমালে আইলাপিউ পেপি-💝😽",
            "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
            "জান তোমার বান্ধবী রে আমার বস মিলনের হাতে তুলে দিবা-🙊🙆‍♂",
            "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন কাশী-😪🤧",
            "ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦",
            "চুনা ও চুনা আমার বস মিলন এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
            "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
            "জান কিস দিবা-🙊😝🌻",
            "জান মেয়ে হলে চিপায় আসো বস মিলনের থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
            "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
            "আমার বস মিলনের পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস মিলন ইসলামে'র জন্য দোয়া করবেন-💝💚🌺🌻",
            "- ভালোবাসা নামক আব্লামি করতে মন চাইলে আমার বস মিলন এর ইনবক্স চলে যাও-🙊🥱👅 🌻𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 𝐋𝐈𝐧𝐤 🌻:- https://fb.com/61593943674779",
            "আমার জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
            "কিরে প্রেম করবি তাহলে বস মিলনের ইনবক্সে গুতা দে 😘🤌 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://fb.com/61593943674779",
            "জান আমার বস মিলন কে বিয়ে করবা-🙊😘🥳",
            "-আন্টি-🙆-আপনার মেয়ে-👰‍♀️-রাতে আমারে ভিদু কল দিতে বলে🫣-🥵🤤💦",
            "oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂",
            "-আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস মিলন কে দান করেন-🥱🐰🍒",
            "-ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧",
            "-অনুমতি দিলাম-𝙋𝙧𝙤𝙥𝙤𝙨𝙚 কর বস মিলন কে-🐸😾🔪",
            "-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝗮𝗰𝗸𝗺𝗮𝐢𝐥 করা হচ্ছে-🥲🤦‍♂️🤧",
            "-𝗢𝗶𝗶 আন্টি-🙆‍♂️-তোমার মেয়ে চোখ মারে-🥺🥴🐸",
            "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
            "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇",
            "-আমার গল্পে তোমার নানি সেরা-🙊🙆‍♂️🤗",
            "কি ব্যাপার, আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻",
            "দিনশেষে পরের 𝐁𝐎𝐖 সুন্দর-☹️🤧",
"-তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই তাতে যা হই হোক-🤧🥱🌻",
"-ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম-😦🙂🌻",
"প্রেম করতে চাইলে বস মিলনের ইনবক্সে চলে যা 😏🐸 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://fb.com/61593943674779",
"-আজ একটা বিন নেই বলে ফেসবুকের নাগিন-🤧-গুলোরে আমার বস মিলন ধরতে পারছে না-🐸🥲",
"-চুমু থাকতে তোরা বিড়ি খাস কেন বুঝা আমারে-😑😒🐸⚒️",
"—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-আমার বস মিলন এর সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸🤗",
"—হাজারো লুচ্চা লুচ্চির ভিরে-🙊🥵আমার বস মিলন এক নিস্পাপ ভালো মানুষ-🥱🤗🙆‍♂️",
"-রূপের অহংকার করো না-🙂❤️চকচকে সূর্যটাও দিনশেষে অন্ধকারে পরিণত হয়-🤗💜",
"সুন্দর মাইয়া মানেই-🥱আমার বস মিলনে'র বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸🤗",
"এত অহংকার করে লাভ নেই-🌸মৃত্যুটা নিশ্চিত শুধু সময়টা অ'নিশ্চিত-🖤🙂",
"-দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি-🙂😿🌸",
"ভালোবাসার নামক আবলামি করতে চাইলে বস মিলনে'র ইনবক্সে গুতা দিন🤣😼",
"মেয়ে হলে বস মিলনের ইনবক্সে চলে যা 🤭🤣😼 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://fb.com/61593943674779",
"হুদাই আমারে শয়তানে লারে-😝😑☹️",
"-𝗜 𝗟𝗢𝗩𝗘 𝗬𝗢𝗨-😽-আহারে ভাবছো তোমারে প্রোপজ করছি-🥴-থাপ্পর দিয়া কিডনী লক করে দিব-😒-ভুল পড়া বের করে দিবো-🤭🐸",
"-আমি একটা দুধের শিশু-😇-🫵𝗬𝗢𝗨🐸💦",
"-কতদিন হয়ে গেলো বিছনায় মুতি না-😿-মিস ইউ নেংটা কাল-🥺🤧",
"-বালিকা━👸-𝐃𝐨 𝐲𝐨𝐮-🫵-বিয়া-𝐦𝐞-😽-আমি তোমাকে-😻-আম্মু হইতে সাহায্য করব-🙈🥱",
"-এই আন্টির মেয়ে-🫢🙈-𝐔𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐡-😽🫶-আসলেই তো স্বাদ-🥵💦-এতো স্বাদ কেন-🤔-সেই স্বাদ-😋",
"-ইস কেউ যদি বলতো-🙂-আমার শুধু তোমাকেই লাগবে-💜🌸",
"-ওই বেডি তোমার বাসায় না আমার বস মিলন মেয়ে দেখতে গেছিলো-🙃-নাস্তা আনারস আর দুধ দিছো-🙄🤦‍♂️-বইন কইলেই তো হয় বয়ফ্রেন্ড আছে-🥺🤦‍♂-আমার বস মিলন কে জানে মারার কি দরকার-🙄🤧",
"-একদিন সে ঠিকই ফিরে তাকাবে-😇-আর মুচকি হেসে বলবে ওর মতো আর কেউ ভালবাসেনি-🙂😅",
"-হুদাই গ্রুপে আছি-🥺🐸-কেও ইনবক্সে নক দিয়ে বলে না জান তোমারে আমি অনেক ভালোবাসি-🥺🤧",
"কি'রে গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
"-দেশের সব কিছুই চুরি হচ্ছে-🙄-শুধু আমার বস মিলনের এর মনটা ছাড়া-🥴😑😏",
"-🫵তোমারে প্রচুর ভাল্লাগে-😽-সময় মতো প্রপোজ করমু বুঝছো-🔨😼-ছিট খালি রাইখো- 🥱🐸🥵",
"-আজ থেকে আর কাউকে পাত্তা দিমু চিহ্নিত না -!😏-কারণ আমি ফর্সা হওয়ার ক্রিম কিনছি -!🙂🐸"
        ]; 
        
        if (!text && attachments.length === 0) { 
            const babyMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)]; 
            return await api.sendMessage(babyMessage, event.threadID, (err, info) => { 
                if (!err) { global.GoatBot.onReply.set(info.messageID, { commandName: module.exports.config.name, type: "reply", messageID: info.messageID, author: event.senderID, text: babyMessage }); } 
            }, event.messageID); 
        } 
        
        const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(text)}&font=3&senderID=${encodeURIComponent(event.senderID)}`, { attachments })).data.reply; 
        return await api.sendMessage(response, event.threadID, (err, info) => { 
            if (!err) { global.GoatBot.onReply.set(info.messageID, { commandName: module.exports.config.name, type: "reply", messageID: info.messageID, author: event.senderID, text: response }); } 
        }, event.messageID); 
    } 
} catch (err) { 
    console.error(err); 
} 
};
