const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "hack2",
    version: "17.0.0",
    author: "MILON",
    countDown: 2, // 
    role: 0, // ০ মানে সবার জন্য উন্মুক্ত, কোনো Access Denied আসবে না
    shortDescription: "Advanced Cyber Penetration Testing Simulator (Bypass Version)",
    longDescription: "Generates a highly convincing cyber penetration simulation with real-time dynamic GIF compilation.",
    category: "system",
    guide: {
      en: "{pn} @mention or reply"
    }
  },
  
  onStart: async function ({ event, message, usersData, api }) {
    // যেকোনো পারমিশন সিকিউরিটি বাইপাস করার জন্য কোর লজিক
    const { type, messageReply, mentions, senderID } = event;
    let targetID = senderID;
    
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    if (targetID == api.getCurrentUserID()) {
      return message.reply("❌ [-] Error: Local host network bypass denied. নিজের আইডি হ্যাক করা সম্ভব না মামা!");
    }

    const cacheDir = path.join(__dirname, "cache");
    const gifPath = path.join(cacheDir, `cyber_breach_${targetID}.gif`);

    let procMessage;

    try {
      await fs.ensureDir(cacheDir);

      const targetData = await usersData.get(targetID) || {};
      const userName = targetData.name || "Unknown User";
      
      // ✅ Gender Detection Fixed Logic
      let userGender = "UNKNOWN";
      try {
        let genderVal = targetData.gender;
        
        // ডাটাবেসে না থাকলে API থেকে রিয়েলটাইম চেক করবে
        if (genderVal === undefined || genderVal === null) {
          const fbUserInfo = await api.getUserInfo(targetID);
          if (fbUserInfo && fbUserInfo[targetID]) {
            genderVal = fbUserInfo[targetID].gender;
          }
        }

        // Facebook API তে 1 = Female, 2 = Male
        if (genderVal === 1 || String(genderVal).toLowerCase() === "female") {
          userGender = "FEMALE";
        } else if (genderVal === 2 || String(genderVal).toLowerCase() === "male") {
          userGender = "MALE";
        } else {
          userGender = "PRIVATE / HIDDEN";
        }
      } catch (e) {
        userGender = "MALE"; // Fallback default
      }

      // ১. প্রথম টার্মিনাল মেসেজ
      let log1 = `📡 [START] Initializing MILON Hacking Framework 4.0...\n`;
      log1 += `──────────────────────────────────\n`;
      log1 += `👤 TARGET: ${userName}\n`;
      log1 += `🆔 SYSTEM ID: ${targetID}\n`;
      log1 += `🔓 [STATUS] ক্রাশের চ্যাট হিস্ট্রি এবং ইনবক্সের সিকিউরিটি বাইপাস রিকোয়েস্ট সেন্ড করা হচ্ছে...`;

      procMessage = await message.reply(log1);

      // ২. ইন্টারনাল মেমোরি স্ক্যান
      setTimeout(async () => {
        let log2 = `🔓 [BREACH] Device gallery and messenger directory access GRANTED!\n`;
        log2 += `──────────────────────────────────\n`;
        log2 += `📂 DIRECTORY: /internal_storage/DCIM/Secret_Folder/\n`;
        log2 += `🔑 TOKEN DATA: active_session_token.db (Controlled by MILON)\n`;
        log2 += `🚨 [STATUS] ইউজারের সিঙ্গেল থাকার আফসোসের চ্যাট ও মেমোরি ক্যাশ ডাম্প করা হচ্ছে...`;
        await api.editMessage(log2, procMessage.messageID).catch(() => {});
      }, 2500);

      // ফেসবুক সার্ভার থেকে প্রোফাইল ছবি সংগ্রহ
      const fbToken = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=400&height=400&access_token=${fbToken}`;
      const imgResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(imgResponse.data);

      // ৩. ডাটা সিঙ্কিং প্রসেস
      setTimeout(async () => {
        await api.editMessage(`📥 [EXTRACTING] Synchronizing data with MILON BOSS Cloud Server...\n──────────────────────────────────\n⚡ [STATUS] Compiling live metasploit binary GIF... (100% Completed)`, procMessage.messageID).catch(() => {});
      }, 5000);

      // 🎨 GIF জেনারেশন প্রসেস (স্ক্রোলিং টেক্সট ও ভিডিও লুপ)
      const encoder = new GIFEncoder(400, 400);
      encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
      encoder.start();
      encoder.setRepeat(0); 
      encoder.setDelay(110); 
      encoder.setQuality(10); 

      const canvas = createCanvas(400, 400);
      const ctx = canvas.getContext("2d");
      const img = await loadImage(avatarBuffer);

      for (let i = 0; i < 15; i++) {
        ctx.clearRect(0, 0, 400, 400);

        // ব্যাকগ্রাউন্ড প্রোফাইল পিকচার
        ctx.drawImage(img, 0, 0, 400, 400);

        // DARK CYBER VIGNETTE
        let gradient = ctx.createRadialGradient(200, 200, 30, 200, 200, 240);
        gradient.addColorStop(0, "rgba(20, 0, 35, 0.2)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.98)"); 
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // ওভারলে ডার্কনেস
        ctx.fillStyle = "rgba(5, 5, 10, 0.6)"; 
        ctx.fillRect(0, 0, 400, 400);

        // উপর থেকে নিচে নামা লাল লেজার স্ক্যানার লাইন
        let scanY = (i * 26);
        ctx.strokeStyle = "#ff0033";
        ctx.lineWidth = 4; 
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff0033";
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(400, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // নিচ থেকে উপরে উঠা ডাইনামিক বাইনারি কোড (ম্যাট্রিক্স)
        ctx.fillStyle = "#ff0055"; 
        ctx.font = "12px Courier New";
        for (let col = 0; col < 15; col++) {
          let xPos = col * 28 + 10;
          let yPos = 400 - ((i * 15 + col * 20) % 400);
          let binaryChar = Math.floor(Math.random() * 2).toString();
          ctx.fillText(binaryChar, xPos, yPos);
          ctx.fillText(binaryChar, xPos, yPos - 50); 
        }

        // ডাইনামিক শেকিং গ্লিচ কোঅর্ডিনেট
        let shakeX = Math.floor(Math.random() * 6) - 3;
        let shakeY = Math.floor(Math.random() * 6) - 3;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // ১. ইমোজি ভিডিও অ্যানিমেশন লুপ (👾 👿 ☠️)
        ctx.font = "75px Arial";
        ctx.shadowBlur = 30;
        if (i % 3 === 0) {
          ctx.shadowColor = "#a020f0";
          ctx.fillText("👾", 200 + shakeX, 100 + shakeY);
        } else if (i % 3 === 1) {
          ctx.shadowColor = "#ff0000";
          ctx.fillText("👿", 200 + shakeX, 100 + shakeY);
        } else {
          ctx.shadowColor = "#ffffff";
          ctx.fillText("☠️", 200 + shakeX, 100 + shakeY);
        }
        ctx.shadowBlur = 0;

        // ২. মোঃ মিলন সরকার নাম ডাইনামিক ভিডিও টেক্সট অ্যানিমেশন
        ctx.fillStyle = "rgba(15, 0, 25, 0.95)"; 
        ctx.fillRect(40, 175, 320, 50); 
        ctx.lineWidth = 2;

        if (i % 2 === 0) {
          ctx.strokeStyle = "#ff0055"; 
          ctx.strokeRect(40, 175, 320, 50);
          ctx.fillStyle = "#00ffbb";
          ctx.font = "bold 24px Impact"; 
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#00ffbb";
          ctx.fillText("Md-MILON-Sarkar", 200 + shakeX, 200 + shakeY);
        } else {
          ctx.strokeStyle = "#00ff66"; 
          ctx.strokeRect(40, 175, 320, 50);
          ctx.fillStyle = "#ffcc00";
          ctx.font = "bold 28px Impact"; 
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ffcc00";
          ctx.fillText("⚡ MILON ⚡", 200 + shakeX, 200 + shakeY);
        }
        ctx.shadowBlur = 0;

        // ৩. নিচ থেকে উপরে উঠা স্ক্রোলিং টেক্সট লজিক
        let scrollY = 380 - (i * 16); 
        ctx.fillStyle = "#ffffff"; 
        ctx.font = "bold 16px Impact";
        ctx.strokeStyle = "#ff0000"; 
        ctx.lineWidth = 1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff0033";

        ctx.fillText("2026 AR NOBIN TORE HACK KORA HOLO", 200, scrollY);
        ctx.strokeText("2026 AR NOBIN TORE HACK KORA HOLO", 200, scrollY);
        ctx.shadowBlur = 0;

        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic"; 

        // টার্মিনাল লগ টেক্সট
        ctx.fillStyle = "#ff0033";
        ctx.font = "bold 13px Courier New";
        ctx.fillText(`[MONSTER_INJECTED]: TRUE`, 15, 25);
        ctx.fillText(`[BYPASS_CORE]: MILON_ACTIVE`, 15, 45);
        ctx.fillText(`[STATUS]: EXTREME_DARK_BREACH`, 15, 380);

        encoder.addFrame(ctx);
      }
      encoder.finish();

      const totalMessages = Math.floor(Math.random() * (45000 - 15000 + 1)) + 15000;
      const funnyPics = Math.floor(Math.random() * (200 - 50 + 1)) + 50;

      // ৪. ফাইনাল রিপোর্ট ডায়ালগ
      let finalReport = `🚨 𝐌𝐈𝐋𝐎𝐍 𝐇𝐀𝐂𝐊 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋 𝐁𝐑𝐄𝐀𝐂𝐇 🚨\n`;
      finalReport += `──────────────────────────────────\n\n`;
      finalReport += `[👤 VICTIM PROFILE DATA]\n`;
      finalReport += `• Name: ${userName}\n`;
      finalReport += `• System ID: ${targetID}\n`;
      finalReport += `• Gender: ${userGender}\n`;
      finalReport += `• Profile Link: https://www.facebook.com/${targetID}\n\n`;
      finalReport += `[🔒 EXTRACTED DATA SUMMARY]\n`;
      finalReport += `• Session Status: OAuth 2.0 token successfully synced with MILON Mainframe Server.\n`;
      finalReport += `• Database Clone: ইনবক্স থেকে সর্বমোট ${totalMessages}টি চ্যাট মেসেজ এবং ক্রাশের মেসেজে 'সিন করে রিপ্লাই না দেওয়া'-র প্রমান পাওয়া গেছে।\n`;
      finalReport += `• Secret File Dump: গ্যালারি থেকে ${funnyPics}টি পচানি ও ফানি স্ক্রিনশট রিমোট হোস্টে ব্যাকআপ নেওয়া হয়েছে।\n\n`;
      finalReport += `──────────────────────────────────\n`;
      finalReport += `🛰️ CENTRAL CLOUD HOST MAIN-FRAME SERVER\n`;
      finalReport += `──────────────────────────────────\n\n`;
      finalReport += `⚠️ [IMPORTANT NOTICE]\n`;
      finalReport += `All metadata and system dump files of this account have been successfully transferred to "Md MILON Sarkar" secured hosting database.\n\n`;
      finalReport += `🛑 [WARNING] অ্যাকাউন্টটি বর্তমানে মিলন বসের রাডারে রয়েছে। পরবর্তী ১০ মিনিটের মধ্যে মিলন বসকে একটা কফি অথবা চকলেট ট্রিট না দিলে, সমস্ত গোপন চ্যাট হিস্ট্রি গ্রুপে লিক করে দেওয়া হবে! 😉`;

      setTimeout(async () => {
        try {
          if (procMessage && procMessage.messageID) {
            await api.unsendMessage(procMessage.messageID);
          }
        } catch (e) {}

        await message.reply({
          body: finalReport,
          attachment: fs.createReadStream(gifPath)
        });

        if (await fs.pathExists(gifPath)) {
          await fs.unlink(gifPath);
        }
      }, 12000); 

    } catch (error) {
      console.error("Scan Command Error:", error);
      if (await fs.pathExists(gifPath)) {
        await fs.unlink(gifPath);
      }
      try {
        if (procMessage && procMessage.messageID) await api.unsendMessage(procMessage.messageID);
      } catch (e) {}

      message.reply("❌ [-] Connection timed out. Target system firewall deployed adaptive defenses.");
    }
  }
};
