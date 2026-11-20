const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

// 🔒 ORIGINAL AUTHOR LOCK
const ORIGINAL_AUTHOR = "𝕸𝖎𝖑𝖔𝖓";

function verifyAuthor(author) {
  return author === ORIGINAL_AUTHOR;
}

// ⚙️ SETTINGS
const ACCESS_TOKEN =
  "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

const BACKGROUND =
  "https://i.imgur.com/CCPtzUC.jpeg";

const BLOCKED_USERS = [
  "61570641868681",
  "61574478201014"
];

module.exports = {
  config: {
    name: "kachu",
    aliases: ["কচু", "kachubone"],
    version: "2.0.0",
    author: "𝕸𝖎𝖑𝖔𝖓",
    countDown: 5,
    role: 0,
    shortDescription: "কচু বনে কালো কুকুরে 🤣",
    longDescription:
      "Create a funny kachu-bon meme with two profile pictures.",
    category: "fun",
    guide: "{pn} @mention | reply | uid"
  },

  onStart: async function ({
    event,
    message,
    usersData
  }) {

    // 🔒 AUTHOR LOCK
    if (!verifyAuthor(this.config.author)) {
      return message.reply(
        `❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`
      );
    }

    // 👤 SENDER
    const senderID = String(event.senderID);
    let targetID = null;

    // 🎯 FIND TARGET
    if (event.messageReply?.senderID) {
      targetID = String(event.messageReply.senderID);
    } else {
      const mentionIDs = Object.keys(event.mentions || {});

      if (mentionIDs.length > 0) {
        targetID = String(mentionIDs[0]);
      } else {
        const match = event.body?.match(/\b\d{8,20}\b/);

        if (match) {
          targetID = match[0];
        }
      }
    }

    if (!targetID) {
      return message.reply(
        "🤣 কাকে কচু বনে পাঠাবে?\n\n" +
        "👉 কাউকে Mention করো\n" +
        "📌 অথবা তার মেসেজে Reply দাও\n" +
        "📍 অথবা তার Facebook UID দাও"
      );
    }

    if (targetID === senderID) {
      return message.reply(
        "🤣 নিজেই কচু বনে হাগবে নাকি?"
      );
    }

    if (BLOCKED_USERS.includes(targetID)) {
      return message.reply(
        "🚫 এই ইউজারকে নিয়ে কমান্ডটি ব্যবহার করা যাবে না!"
      );
    }

    let filePath = null;

    try {

      // 🖼️ SEPARATE PROFILE URLS
      const avatar1 =
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;

      const avatar2 =
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;

      // 📥 LOAD THREE IMAGES SEPARATELY
      const img1 = await Canvas.loadImage(avatar1);
      const img2 = await Canvas.loadImage(avatar2);
      const bgImg = await Canvas.loadImage(BACKGROUND);

      // 🎨 CREATE CANVAS
      const canvas = Canvas.createCanvas(
        bgImg.width,
        bgImg.height
      );

      const ctx = canvas.getContext("2d");

      // BACKGROUND
      ctx.drawImage(
        bgImg,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 📍 PROFILE POSITIONS
      // x আগের থেকে 40 করে বাড়ানো হয়েছে

      const p1 = {
        x: 550,
        y: 110,
        r: 42
      };

      const p2 = {
        x: 420,
        y: 210,
        r: 42
      };

      // ✂️ DRAW AVATAR
      function drawAvatar(image, position) {
        ctx.save();

        ctx.beginPath();

        ctx.arc(
          position.x,
          position.y,
          position.r,
          0,
          Math.PI * 2
        );

        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
          image,
          position.x - position.r,
          position.y - position.r,
          position.r * 2,
          position.r * 2
        );

        ctx.restore();
      }

      // 👥 DRAW BOTH USERS
      drawAvatar(img1, p1);
      drawAvatar(img2, p2);

      // 💾 SAVE IMAGE
      const tempDir = path.join(
        __dirname,
        "tmp"
      );

      await fs.ensureDir(tempDir);

      filePath = path.join(
        tempDir,
        `kachu_${senderID}_${targetID}_${Date.now()}.png`
      );

      await fs.promises.writeFile(
        filePath,
        canvas.toBuffer("image/png")
      );

      // 😂 SINGLE BODY MESSAGE
      const caption =
        "🌿 কচু বনে হেগে গেল কালো কুকুরে! 🤣🐕💩";

      // 📤 SEND RESULT
      return message.reply(
        {
          body: caption,
          attachment: fs.createReadStream(filePath)
        },
        async (error) => {

          if (error) {
            console.error(
              "KACHU SEND ERROR:",
              error
            );
          }

          await fs.remove(filePath).catch(() => {});
        }
      );

    } catch (error) {

      console.error(
        "KACHU ERROR:",
        error
      );

      if (filePath) {
        await fs.remove(filePath).catch(() => {});
      }

      return message.reply(
        "❌ Api Error Call Boss Milon"
      );
    }
  }
};
