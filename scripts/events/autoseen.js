module.exports.config = {
    name: "autoseen",
    eventType: ["message", "message_reply"],
    version: "1.0.1",
    credits: "Milon",
    description: "শর্ত সাপেক্ষে মেসেজ সিন করবে (কমান্ড, মেনশন বা লিংক ছাড়া অটো সিন করবে না)"
};

module.exports.run = async function({ api, event }) {
    const { body, threadID } = event;
    if (!body) return;

    let shouldSeen = false;

    // ১. প্রফিক্স বা কমান্ড চেক (যেমন: '!', '.', ইত্যাদি দিয়ে শুরু হলে)
    const globalConfig = global.config || {};
    const PREFIX = globalConfig.PREFIX || "!";
    
    if (body.startsWith(PREFIX)) {
        shouldSeen = true;
    }

    // ২. বটকে সরাসরি মেনশন করা হলে
    const botID = api.getCurrentUserID();
    if (event.mentions && Object.keys(event.mentions).includes(botID)) {
        shouldSeen = true;
    }

    // ৩. মেসেজে কোনো লিংক (URL) থাকলে (যেহেতু আপনার গ্রুপে অটো-ডাউনলোড কোড আছে)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(body)) {
        shouldSeen = true;
    }

    // শর্ত পূরণ হলেই কেবল মেসেজ সিন (Read) করবে, নতুবা এড়িয়ে যাবে
    if (shouldSeen) {
        api.markAsRead(threadID, (err) => {
            if (err) console.error("Auto-seen error:", err);
        });
    }
};
