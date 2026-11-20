const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// 🔒 ORIGINAL AUTHOR LOCK
const ORIGINAL_AUTHOR = "𝕸𝖎𝖑𝖔𝖓";

function verifyAuthor(configAuthor) {
  return configAuthor === ORIGINAL_AUTHOR;
}

module.exports = {
  config: {
    name: "chagol",
    aliases: ["goatpic", "chagolpic"],
    version: "1.0.1",
    author: "𝕸𝖎𝖑𝖔𝖓",
    countDown: 5,
    role: 0,
    category: "fun",
    usePrefix: true,
    description: "Create a goat image by mentioning or replying to a user.",
    guide: "{pn} @mention or reply"
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: ─꯭─⃝͎̽𓆩মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ‣᭄𓆪___//😽🩵🪽
 * 👤 OWNER: 𝕸𝖎𝖑𝖔𝖓
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onStart: async function ({ api, event, message }) {
    
    // 🔒 ANTI-EDIT CHECK
    if (!verifyAuthor(this.config.author)) {
      return message.reply(`❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`);
    }

    const { threadID, messageID, mentions, messageReply } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      targetID = event.senderID;
    }

    const imgPath = path.join(cacheDir, `chagol_milon_${Date.now()}.png`);

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      // 🖼️ ছাগলের ব্যাকগ্রাউন্ড ইমেজের লিংক
      const backgroundUrl = "https://i.imgur.com/8xpLnLt.jpeg";
      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [bgImg, avatarImg] = await Promise.all([
        loadImage(backgroundUrl),
        loadImage(avatarUrl)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      // ব্যাকগ্রাউন্ড ড্র করা
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // 📐 ছাগলের মাথার ওপর প্রোফাইল পিকের নিখুঁত পজিশন ও সাইজ
      const pfpSize = 65; 
      const x = 250; // ডানে-বামে
      const y = 25;  // ওপরে-নিচে

      ctx.save();
      
      // প্রোফাইল পিক গোল করে কাটা
      ctx.beginPath();
      ctx.arc(
        x + pfpSize / 2,
        y + pfpSize / 2,
        pfpSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatarImg, x, y, pfpSize, pfpSize);

      ctx.restore();

      // ন্যাচারাল ফিনিশিংয়ের জন্য কালো বর্ডার
      ctx.beginPath();
      ctx.arc(
        x + pfpSize / 2,
        y + pfpSize / 2,
        pfpSize / 2,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      const finalCaption = `🐐 তুই আসলেই একটা ছাগল: ${userName} 🤣`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, messageID);

    } catch (error) {
      console.error("CHAGOL ERROR:", error);
      return message.reply("Api Error Call Boss Milon");
    }
  }
};
