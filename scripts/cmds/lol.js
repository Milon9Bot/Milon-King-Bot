const axios = require("axios");
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
    name: "lol",
    version: "1.0.0",
    author: "𝕸𝖎𝖑𝖔𝖓",
    countDown: 5,
    role: 0,
    category: "fun",
    usePrefix: true,
    description: "Funny profile picture edit 😂",
    guide: "{pn} @mention or reply"
  },

  onStart: async function ({ api, event, message }) {

    // 🔒 ANTI-EDIT CHECK
    if (!verifyAuthor(this.config.author)) {
      return message.reply(
        `❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`
      );
    }

    const {
      threadID,
      messageID,
      mentions,
      messageReply
    } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    await fs.ensureDir(cacheDir);

    let targetID = null;
    let filePath = null;

    // 🎯 Find target user
    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;
    }

    if (!targetID) {
      return message.reply(
        "😂 মামা, কাউকে মেনশন দাও অথবা তার মেসেজে রিপ্লাই করো!"
      );
    }

    try {
      // 👤 Get user information
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo?.[targetID]?.name || "User";

      // 🖼️ Background image
      const imgLink = "https://i.imgur.com/lIKa4om.jpeg";

      filePath = path.join(
        cacheDir,
        `lol_milon_${Date.now()}.png`
      );

      // 📸 Facebook profile picture API
      const accessToken =
        "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      const targetPfpUrl =
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      // Load both images
      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      // 🎨 Create canvas
      const canvas = createCanvas(
        baseImage.width,
        baseImage.height
      );

      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(
        baseImage,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 📐 Profile picture size and position
      const pfpWidth = 60;
      const pfpHeight = 60;

      const x = 110;
      const y = 65;

      // Circular profile picture
      ctx.save();

      ctx.beginPath();
      ctx.arc(
        x + pfpWidth / 2,
        y + pfpHeight / 2,
        Math.min(pfpWidth, pfpHeight) / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        targetPfp,
        x,
        y,
        pfpWidth,
        pfpHeight
      );

      ctx.restore();

      // ⚪ White border
      ctx.beginPath();
      ctx.arc(
        x + pfpWidth / 2,
        y + pfpHeight / 2,
        Math.min(pfpWidth, pfpHeight) / 2,
        0,
        Math.PI * 2
      );

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // 💾 Save image
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(filePath, buffer);

      // 📝 Final caption
      const finalCaption =
`🤣 আরে মামা, এইটা কী অবস্থা!

👤 নাম: ${userName}
😂 পুরাই LOL হয়ে গেছে!
👑 Call Boss Milon`;

      // 📤 Send final image without waiting message
      return api.sendMessage(
        {
          body: finalCaption,
          mentions: [
            {
              tag: userName,
              id: targetID
            }
          ],
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          if (filePath) {
            fs.remove(filePath).catch(() => {});
          }
        },
        messageID
      );

    } catch (error) {
      console.error("LOL ERROR:", error);

      // 🧹 Remove temporary file
      if (filePath) {
        await fs.remove(filePath).catch(() => {});
      }

      // ⚠️ Error message
      return message.reply(
        "⚠️ Api Error Call Boss Milon"
      );
    }
  }
};
