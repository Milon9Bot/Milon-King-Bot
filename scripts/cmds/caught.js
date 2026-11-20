const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

const xalman_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";
const BACKGROUND = "https://i.imgur.com/OiFFe07.jpeg";

const ORIGINAL_AUTHOR = "𝕸𝖎𝖑𝖔𝖓";

function verifyAuthor(configAuthor) {
  return configAuthor === ORIGINAL_AUTHOR;
}

module.exports = {
  config: {
    name: "caught",
    aliases: ["কট"],
    version: "1.0.0",
    author: "𝕸𝖎𝖑𝖔𝖓",
    role: 0,
    countDown: 5,
    shortDescription: "Generate a caught couple image",
    longDescription: "Generate a funny caught couple image using profile pictures of the sender and target.",
    category: "fun",
    guide: { en: "{pn} @mention | reply | uid" }
  },

  onStart: async function ({ api, event, message, usersData }) {
    if (!verifyAuthor(this.config.author)) {
      return message.reply(
        `❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`
      );
    }

    const senderID = event.senderID;
    let targetID = null;

    if (event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    } 
    else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } 
    else {
      const match = event.body?.match(/\b\d{8,20}\b/);
      if (match) targetID = match[0];
    }

    if (!targetID) {
      return message.reply("❌ Please reply to someone, mention them, or provide a valid UID.");
    }

    try {
      // name1 = Sender, name2 = Victim/Target
      const name1 = await usersData.getName(senderID).catch(() => "User");
      const name2 = await usersData.getName(targetID).catch(() => "Target");

      // avatar1 = Sender (Left side / Male body), avatar2 = Victim/Target (Right side / Female body)
      const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${xalman_TOKEN}`;
      const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${xalman_TOKEN}`;

      const [img1, img2, bgImg] = await Promise.all([
        Canvas.loadImage(avatar1), // img1 is Sender
        Canvas.loadImage(avatar2), // img2 is Victim
        Canvas.loadImage(BACKGROUND)
      ]);

      const canvas = Canvas.createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0);

      // p1 = Position for Sender (Left side), p2 = Position for Victim (Right side)
      const p1 = { x: 165, y: 95, r: 35 };
      const p2 = { x: 345, y: 115, r: 35 };

      const drawAvatar = (img, pos) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, pos.x - pos.r, pos.y - pos.r, pos.r * 2, pos.r * 2);
        ctx.restore();
      };

      drawAvatar(img1, p1); // Draws Sender at left p1
      drawAvatar(img2, p2); // Draws Victim at right p2

      const file = path.join(__dirname, "tmp", `caught_${senderID}_${targetID}.png`);

      await fs.ensureDir(path.dirname(file));
      await fs.writeFile(file, canvas.toBuffer());

      message.reply(
        {
          body: `${name2} এবং ${name1} হাতেনাতে ধরা পড়ে গেছে! 🤭📸`,
          attachment: fs.createReadStream(file)
        },
        () => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }
      );

    } catch (error) {
      console.error("Caught command error:", error);
      message.reply("❌ Api Error Call Boss Milon");
    }
  }
};
