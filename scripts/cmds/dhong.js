const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

// ==================================================
// 🔒 ORIGINAL AUTHOR LOCK
// ==================================================

const ORIGINAL_AUTHOR = "𝕸𝖎𝖑𝖔𝖓";

function verifyAuthor(author) {
  return author === ORIGINAL_AUTHOR;
}

// ==================================================
// ⚙️ SETTINGS
// ==================================================

const ACCESS_TOKEN =
  "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

const BACKGROUND =
  "https://i.imgur.com/520vtly.jpeg";

const BLOCKED_USERS = [
  "61570641868681",
  "61574478201014"
];

// ==================================================
// 📦 COMMAND
// ==================================================

module.exports = {

  config: {
    name: "dhong",
    aliases: ["ঢং", "dhongbaaz"],
    version: "3.0.0",

    // ⚠️ এই নাম পরিবর্তন করা যাবে না
    author: "𝕸𝖎𝖑𝖔𝖓",

    countDown: 5,
    role: 0,

    shortDescription: "ঢংবাজি 🤣",

    longDescription:
      "Create a funny dhong meme with two profile pictures.",

    category: "fun",

    guide:
      "{pn} @mention | reply | uid"
  },

  // ==================================================
  // 🚀 ON START
  // ==================================================

  onStart: async function ({
    event,
    message,
    usersData
  }) {

    // ==================================================
    // 🔒 AUTHOR LOCK CHECK
    // ==================================================

    if (!verifyAuthor(this.config.author)) {

      return message.reply(
        "🚫 AUTHOR LOCK ACTIVATED!\n\n" +

        "❌ This command is not working because the " +
        "original author name has been changed.\n\n" +

        "👑 Original Author:\n" +
        `${ORIGINAL_AUTHOR}\n\n` +

        "⚠️ Please set the config author exactly as:\n" +
        `"${ORIGINAL_AUTHOR}"\n\n` +

        "🛡️ Changing the original author name is not allowed."
      );
    }

    // ==================================================
    // 👤 SENDER ID
    // ==================================================

    const senderID = String(event.senderID);

    let targetID = null;

    // ==================================================
    // 🎯 FIND TARGET
    // ==================================================

    // Reply
    if (event.messageReply?.senderID) {

      targetID = String(
        event.messageReply.senderID
      );

    } else {

      // Mention
      const mentionIDs =
        Object.keys(event.mentions || {});

      if (mentionIDs.length > 0) {

        targetID =
          String(mentionIDs[0]);

      } else {

        // UID
        const match =
          event.body?.match(/\b\d{8,20}\b/);

        if (match) {
          targetID = match[0];
        }
      }
    }

    // ==================================================
    // ❌ NO TARGET
    // ==================================================

    if (!targetID) {

      return message.reply(
        "🤣 কাকে নিয়ে ঢং করাবে?\n\n" +

        "👉 কাউকে Mention করো\n" +
        "📌 অথবা তার মেসেজে Reply দাও\n" +
        "📍 অথবা তার Facebook UID দাও"
      );
    }

    // ==================================================
    // 🚫 SAME USER
    // ==================================================

    if (targetID === senderID) {

      return message.reply(
        "🤣 নিজের সাথেই আবার ঢং করো নাকি?"
      );
    }

    // ==================================================
    // 🚫 BLOCKED USER
    // ==================================================

    if (BLOCKED_USERS.includes(targetID)) {

      return message.reply(
        "🚫 এই ইউজারকে নিয়ে কমান্ডটি ব্যবহার করা যাবে না!"
      );
    }

    let filePath = null;

    try {

      // ==================================================
      // 📝 GET TARGET NAME
      // ==================================================

      let targetName = null;

      // 1️⃣ usersData.getName()
      try {

        targetName =
          await usersData.getName(targetID);

      } catch (e) {
        targetName = null;
      }

      // 2️⃣ Check usersData.get()
      if (!targetName) {

        try {

          const userInfo =
            await usersData.get(targetID);

          if (userInfo) {

            targetName =
              userInfo.name ||
              userInfo.fullName ||
              userInfo.userName ||
              null;
          }

        } catch (e) {
          targetName = null;
        }
      }

      // 3️⃣ Check mention name
      if (!targetName) {

        const mentionData =
          event.mentions?.[targetID];

        if (mentionData) {

          if (typeof mentionData === "string") {
            targetName = mentionData;
          } else {
            targetName =
              mentionData.name ||
              mentionData.tag ||
              null;
          }
        }
      }

      // 4️⃣ Final fallback
      if (
        !targetName ||
        targetName === "null" ||
        targetName === "undefined"
      ) {
        targetName = "বন্ধু";
      }

      // ==================================================
      // 🖼️ PROFILE URLS
      // ==================================================

      const avatar1 =
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;

      const avatar2 =
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;

      // ==================================================
      // 📥 LOAD IMAGES
      // ==================================================

      const img1 =
        await Canvas.loadImage(avatar1);

      const img2 =
        await Canvas.loadImage(avatar2);

      const bgImg =
        await Canvas.loadImage(BACKGROUND);

      // ==================================================
      // 🎨 CREATE CANVAS
      // ==================================================

      const canvas =
        Canvas.createCanvas(
          bgImg.width,
          bgImg.height
        );

      const ctx =
        canvas.getContext("2d");

      // ==================================================
      // 🖼️ DRAW BACKGROUND
      // ==================================================

      ctx.drawImage(
        bgImg,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // ==================================================
      // 📍 PROFILE POSITIONS
      // ==================================================

      const p1 = {
        x: 550,
        y: 110,
        r: 42
      };

      const p2 = {
        x: 285,
        y: 110,
        r: 50
      };

      // ==================================================
      // ✂️ DRAW AVATAR
      // ==================================================

      function drawAvatar(
        image,
        position
      ) {

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

      // ==================================================
      // 👥 DRAW BOTH PROFILE PICTURES
      // ==================================================

      drawAvatar(img1, p1);
      drawAvatar(img2, p2);

      // ==================================================
      // 💾 SAVE IMAGE
      // ==================================================

      const tempDir =
        path.join(
          __dirname,
          "tmp"
        );

      await fs.ensureDir(tempDir);

      filePath =
        path.join(
          tempDir,
          `dhong_${senderID}_${targetID}_${Date.now()}.png`
        );

      await fs.promises.writeFile(
        filePath,
        canvas.toBuffer("image/png")
      );

      // ==================================================
      // 😂 SINGLE BODY MESSAGE
      // ==================================================

      const caption =
        `🤣 ${targetName} এত ঢং করো কেন রে! 😂`;

      // ==================================================
      // 📤 SEND RESULT
      // ==================================================

      return message.reply(
        {
          body: caption,

          attachment:
            fs.createReadStream(filePath),

          mentions: [
            {
              id: targetID,
              tag: targetName
            }
          ]
        },

        async (error) => {

          if (error) {

            console.error(
              "DHONG SEND ERROR:",
              error
            );
          }

          await fs.remove(
            filePath
          ).catch(() => {});
        }
      );

    } catch (error) {

      // ==================================================
      // ❌ ERROR
      // ==================================================

      console.error(
        "DHONG ERROR:",
        error
      );

      if (filePath) {

        await fs.remove(
          filePath
        ).catch(() => {});
      }

      return message.reply(
        "❌ Api Error Call Boss Milon"
      );
    }
  }
};
