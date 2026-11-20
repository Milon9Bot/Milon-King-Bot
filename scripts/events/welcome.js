const { drive } = global.utils;
const { nickNameBot } = global.GoatBot.config;
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const WELCOME_BG_URL =
  "https://i.ibb.co.com/SDpwFkTj/Messenger-creation-E42200-E9-C23-F-4867-A43-A-088-D966709-DC.jpg";

module.exports = {
  config: {
    name: "welcome",
    version: "8.4",
    author: "EryXenX",
    category: "events"
  },

  langs: {
    en: {
      defaultWelcomeMessage:
        "𝗪𝗲𝗹𝗰𝗼𝗺𝗲 {userName} 🎉\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n✦ Glad to have you here! Enjoy your stay and make great memories 🌸",

      botAddedMessage:
        "━━━━━━━━━━━━━━━━━━━\n🤖 ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ! 💖\n\n⚙️ ʙᴏᴛ ᴘʀᴇꜰɪx : /\n📜 ᴛʏᴘᴇ /help ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs\n\n✨ ʟᴇᴛ's ᴍᴀᴋᴇ ᴛʜɪs ɢʀᴏᴜᴘ ᴇᴠᴇɴ ᴍᴏʀᴇ ꜰᴜɴ ᴛᴏɢᴇᴛʜᴇʀ! 😄\n━━━━━━━━━━━━━━━━━━━"
    }
  },

  onStart: async ({
    threadsData,
    message,
    event,
    api,
    usersData,
    getLang
  }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;

    const threadData = await threadsData.get(threadID);

    if (!threadData.settings.sendWelcomeMessage) return;

    const addedMembers = event.logMessageData.addedParticipants;

    const threadName =
      threadData.threadName || "our group";

    const prefix =
      global.utils.getPrefix(threadID);

    const inviterID = event.author;

    for (const user of addedMembers) {
      const userID = user.userFbId;
      const botID = api.getCurrentUserID();

      // ==============================
      // BOT ADDED
      // ==============================

      if (userID == botID) {
        if (nickNameBot) {
          await api.changeNickname(
            nickNameBot,
            threadID,
            botID
          );
        }

        return message.send(
          getLang("botAddedMessage", prefix)
        );
      }

      // ==============================
      // USER INFORMATION
      // ==============================

      const userName = user.fullName;

      const inviterName =
        await usersData.getName(inviterID);

      const memberCount =
        event.participantIDs.length;

      // ==============================
      // WELCOME MESSAGE
      // ==============================

      let {
        welcomeMessage = getLang(
          "defaultWelcomeMessage"
        )
      } = threadData.data;

      welcomeMessage = welcomeMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{userTag\}/g, userName)
        .replace(/\{threadName\}/g, threadName)
        .replace(/\{memberCount\}/g, memberCount)
        .replace(/\{inviterName\}/g, inviterName);

      // ==============================
      // CREATE WELCOME IMAGE
      // ==============================

      let welcomeImagePath = null;

      try {
        welcomeImagePath =
          await createWelcomeCard({
            userName,
            threadName,
            memberCount,
            inviterName,
            newUserID: userID,
            inviterID,
            threadID,
            api
          });
      } catch (err) {
        console.error(
          "Welcome image creation failed:",
          err
        );
      }

      // ==============================
      // MESSAGE FORM
      // ==============================

      const form = {
        body: welcomeMessage,

        mentions: [
          {
            tag: userName,
            id: userID
          }
        ]
      };

      // ==============================
      // ATTACHMENT
      // ==============================

      if (
        welcomeImagePath &&
        fs.existsSync(welcomeImagePath)
      ) {
        form.attachment =
          fs.createReadStream(welcomeImagePath);
      }

      // ==============================
      // FALLBACK ATTACHMENT
      // ==============================

      else if (
        threadData.data.welcomeAttachment
      ) {
        const attachments =
          threadData.data.welcomeAttachment.map(
            f => drive.getFile(f, "stream")
          );

        form.attachment =
          (
            await Promise.allSettled(
              attachments
            )
          )
            .filter(
              ({ status }) =>
                status === "fulfilled"
            )
            .map(
              ({ value }) => value
            );
      }

      // ==============================
      // SEND MESSAGE
      // ==============================

      await message.send(form);

      // ==============================
      // DELETE TEMP IMAGE
      // ==============================

      if (
        welcomeImagePath &&
        fs.existsSync(welcomeImagePath)
      ) {
        setTimeout(() => {
          try {
            fs.unlinkSync(
              welcomeImagePath
            );
          } catch (_) {}
        }, 5000);
      }
    }
  }
};


// ======================================================
// FACEBOOK ACCESS TOKEN
// ======================================================

const ACCESS_TOKEN =
  "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";


// ======================================================
// DOWNLOAD HIGH QUALITY PROFILE
// ======================================================

async function downloadHighQualityProfile(userID) {
  try {
    const url =
      `https://graph.facebook.com/${userID}/picture` +
      `?width=500&height=500` +
      `&access_token=${ACCESS_TOKEN}`;

    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 10000
    });

    return Buffer.from(
      res.data,
      "binary"
    );

  } catch {
    return null;
  }
}


// ======================================================
// DOWNLOAD IMAGE
// ======================================================

async function downloadImage(url) {
  try {
    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 10000
    });

    return Buffer.from(
      res.data,
      "binary"
    );

  } catch {
    return null;
  }
}


// ======================================================
// UNICODE TO NORMAL TEXT
// ======================================================

function unicodeToPlain(str) {
  if (!str) return "";

  const ranges = [
    [0x1D400, 0x1D419, "A"],
    [0x1D41A, 0x1D433, "a"],

    [0x1D434, 0x1D44D, "A"],
    [0x1D44E, 0x1D467, "a"],

    [0x1D468, 0x1D481, "A"],
    [0x1D482, 0x1D49B, "a"],

    [0x1D5D4, 0x1D5ED, "A"],
    [0x1D5EE, 0x1D607, "a"],

    [0x1D63C, 0x1D655, "A"],
    [0x1D656, 0x1D66F, "a"],

    [0x1D7CE, 0x1D7D7, "0"],

    [0xFF21, 0xFF3A, "A"],
    [0xFF41, 0xFF5A, "a"],

    [0xFF10, 0xFF19, "0"],

    [0x24B6, 0x24CF, "A"],
    [0x24D0, 0x24E9, "a"]
  ];

  const singles = {
    0x1D49C: "A",
    0x212C: "B",
    0x2102: "C",
    0x2145: "D",
    0x2130: "E",
    0x2131: "F",
    0x210A: "g",
    0x210B: "H",
    0x2110: "I",
    0x2111: "I",
    0x2112: "L",
    0x2113: "l",
    0x2115: "N",
    0x2118: "P",
    0x211A: "Q",
    0x211B: "R",
    0x211C: "R",
    0x2124: "Z",
    0x2128: "Z",

    0x2070: "0",
    0x00B9: "1",
    0x00B2: "2",
    0x00B3: "3",
    0x2074: "4",
    0x2075: "5",
    0x2076: "6",
    0x2077: "7",
    0x2078: "8",
    0x2079: "9"
  };

  let result = "";

  for (const char of str) {
    const cp = char.codePointAt(0);

    if (singles[cp] !== undefined) {
      result += singles[cp];
      continue;
    }

    let mapped = false;

    for (const [
      start,
      end,
      base
    ] of ranges) {

      if (
        cp >= start &&
        cp <= end
      ) {
        const baseCode =
          base.codePointAt(0);

        result +=
          String.fromCodePoint(
            baseCode + (cp - start)
          );

        mapped = true;
        break;
      }
    }

    if (!mapped) {
      result += char;
    }
  }

  return result;
}


// ======================================================
// SAFE STRING
// ======================================================

function safeStr(str) {
  if (!str) return "";

  try {
    return Buffer
      .from(str, "latin1")
      .toString("utf8");
  } catch {
    return str;
  }
}


// ======================================================
// READABLE TEXT
// ======================================================

function readableText(str) {
  return unicodeToPlain(
    safeStr(str)
  );
}


// ======================================================
// DRAW CIRCLE AVATAR
// ======================================================

function drawCircleAvatar(
  ctx,
  img,
  cx,
  cy,
  r
) {
  ctx.save();

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctx.closePath();

  ctx.clip();

  ctx.drawImage(
    img,
    cx - r,
    cy - r,
    r * 2,
    r * 2
  );

  ctx.restore();
}


// ======================================================
// FIT TEXT
// ======================================================

function fitTextCustom(
  ctx,
  text,
  maxPx,
  size
) {
  let t = text;

  ctx.font =
    `bold ${size}px "Segoe UI", Arial, sans-serif`;

  while (
    ctx.measureText(t).width >
      maxPx &&
    size > 12
  ) {
    size--;

    ctx.font =
      `bold ${size}px "Segoe UI", Arial, sans-serif`;
  }

  if (
    ctx.measureText(t).width >
    maxPx
  ) {
    while (
      ctx.measureText(
        t + "…"
      ).width > maxPx &&
      t.length > 1
    ) {
      t = t.slice(0, -1);
    }

    t += "…";
  }

  return t;
}


// ======================================================
// CREATE WELCOME CARD
// ======================================================

async function createWelcomeCard({
  userName,
  threadName,
  memberCount,
  inviterName,
  newUserID,
  inviterID,
  threadID,
  api
}) {

  // ====================================================
  // LOAD PROFILE
  // ====================================================

  async function loadProfile(uid) {
    const buf =
      await downloadHighQualityProfile(
        uid
      );

    if (buf) {
      return loadImage(buf)
        .catch(() => null);
    }

    try {
      const info =
        await api.getUserInfo([uid]);

      const src =
        info[uid]?.thumbSrc;

      if (src) {
        const b2 =
          await downloadImage(src);

        if (b2) {
          return loadImage(b2)
            .catch(() => null);
        }
      }

    } catch {}

    return null;
  }


  // ====================================================
  // LOAD PROFILE + BACKGROUND
  // ====================================================

  const [
    newUserImg,
    bgBuffer
  ] = await Promise.all([
    loadProfile(newUserID),
    downloadImage(
      WELCOME_BG_URL
    )
  ]);


  // ====================================================
  // LOAD BACKGROUND
  // ====================================================

  const bgImg =
    bgBuffer
      ? await loadImage(bgBuffer)
          .catch(() => null)
      : null;


  // ====================================================
  // CANVAS SIZE
  // ====================================================

  const W =
    bgImg
      ? bgImg.width
      : 1200;

  const H =
    bgImg
      ? bgImg.height
      : 800;


  // ====================================================
  // CREATE CANVAS
  // ====================================================

  const canvas =
    createCanvas(W, H);

  const ctx =
    canvas.getContext("2d");


  // ====================================================
  // DRAW BACKGROUND
  // ====================================================

  if (bgImg) {

    ctx.drawImage(
      bgImg,
      0,
      0,
      W,
      H
    );

  } else {

    ctx.fillStyle =
      "#09090f";

    ctx.fillRect(
      0,
      0,
      W,
      H
    );
  }


  // ====================================================
  // CLEAN TEXT
  // ====================================================

  const safeUser =
    readableText(userName);

  const safeInviter =
    readableText(inviterName);

  const safeGroup =
    readableText(threadName);

  const safeID =
    String(newUserID);


  // ====================================================
  // JOIN TIME
  // ====================================================

  const now =
    new Date();

  const joinTime =
    now.toLocaleString(
      "en-US",
      {
        timeZone:
          "Asia/Dhaka",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          true,

        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric"
      }
    );


  // ====================================================
  // MEMBER COUNT
  // ====================================================

  const memberStr =
    String(memberCount);


  // ====================================================
  // PROFILE IMAGE POSITION
  // ====================================================
  //
  // আগের অবস্থান:
  // W * 0.212
  //
  // নতুন অবস্থান:
  // W * 0.235
  //
  // অর্থাৎ প্রায় 35px ডানদিকে
  // (1536px width হলে)
  //
  // ====================================================

  const avatarCX =
    W * 0.235;

  const avatarCY =
    H * 0.445;

  const avatarR =
    W * 0.105;


  // ====================================================
  // DRAW PROFILE IMAGE
  // ====================================================

  if (newUserImg) {

    drawCircleAvatar(
      ctx,
      newUserImg,
      avatarCX,
      avatarCY,
      avatarR
    );

  } else {

    // ================================================
    // FALLBACK AVATAR
    // ================================================

    ctx.fillStyle =
      "#161628";

    ctx.beginPath();

    ctx.arc(
      avatarCX,
      avatarCY,
      avatarR,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      `bold ${Math.round(
        avatarR * 0.7
      )}px Arial`;

    ctx.fillStyle =
      "rgba(255,255,255,0.15)";

    ctx.fillText(
      "👤",
      avatarCX,
      avatarCY
    );

    ctx.restore();
  }


  // ====================================================
  // RIGHT SIDE TEXT POSITION
  // ====================================================

  const textX =
    W * 0.675;

  const maxTextW =
    W * 0.215;

  const fontSize =
    Math.round(
      H * 0.024
    );


  // ====================================================
  // TEXT ROW POSITIONS
  // ====================================================

  const rowY = [
    0.350,
    0.418,
    0.489,
    0.558,
    0.627,
    0.695
  ];


  // ====================================================
  // TEXT FIELDS
  // ====================================================

  const fields = [
    safeUser,
    safeID,
    safeGroup,
    safeInviter,
    joinTime,
    memberStr
  ];


  // ====================================================
  // DRAW TEXT
  // ====================================================

  ctx.save();

  ctx.textAlign =
    "left";

  ctx.textBaseline =
    "middle";

  fields.forEach(
    (text, index) => {

      const y =
        H * rowY[index];

      const fitted =
        fitTextCustom(
          ctx,
          text,
          maxTextW,
          fontSize
        );

      ctx.fillStyle =
        "#ffffff";

      ctx.shadowColor =
        "rgba(255, 105, 180, 0.7)";

      ctx.shadowBlur =
        8;

      ctx.fillText(
        fitted,
        textX,
        y
      );
    }
  );

  ctx.restore();


  // ====================================================
  // SAVE TEMP IMAGE
  // ====================================================

  const tempPath =
    path.join(
      __dirname,
      `temp_welcome_${Date.now()}.png`
    );


  await fs.writeFile(
    tempPath,
    canvas.toBuffer("image/png")
  );


  return tempPath;
}
