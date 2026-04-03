const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "trans",
    alias: ["currency", "convert"],
    desc: "Convert money with live exchange rates",
    category: "tools",
    react: "💰",
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        // mfano sahihi: .trans 2000 TSH to KSH
        if (args.length !== 4 || args[2].toLowerCase() !== "to") {
            return reply("❌ *Use format:*\n.trans 2000 TSH to KSH");
        }

        const amount = Number(args[0]);
        const fromCur = args[1].toUpperCase();
        const toCur = args[3].toUpperCase();

        if (isNaN(amount)) {
            return reply("❌ Amount must be a number");
        }

        await reply(`⏳ *Converting ${amount} ${fromCur} → ${toCur}*`);

        // API imara (hakihitaji API KEY)
        const url = `https://open.er-api.com/v6/latest/${fromCur}`;
        const res = await axios.get(url);

        if (res.data.result !== "success") {
            return reply("❌ Failed to fetch exchange rates.");
        }

        const rate = res.data.rates[toCur];
        if (!rate) {
            return reply("❌ Currency not supported.");
        }

        const total = (amount * rate).toFixed(2);

        return reply(
`✅ *CONVERSION SUCCESS*

💰 ${amount} ${fromCur}
➡️ ${total} ${toCur}

📊 Rate: ${rate}

> *MARCEUSE-XMD-2❤️ SYSTEM*`
        );

    } catch (err) {
        console.error(err);
        reply("❌ Service temporarily unavailable. Try again later.");
    }
});
