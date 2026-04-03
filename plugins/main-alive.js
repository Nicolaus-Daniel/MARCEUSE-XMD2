  const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["bot", "online"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "✌",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const status = `
❖ *🤖 MARCEUSE-XMD❤️-2 BOT STATUS* ❖─╮
┃ 🟢 *Online & Active*
┃ 👤 *Owner:* ${config.OWNER_NAME}
┃ ⏳ *Uptime:* ${runtime(process.uptime())}
┃ 💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃ ⚙️ *Mode:* ${config.MODE}
┃ 🔖 *Prefix:* ${config.PREFIX}
┃ 💻 *Host:* ${os.hostname()}
┃ 🔢 *Version:* 2.0.0
╰────────────────────────────╯
    ⚡ Powered by Nicolaus Daniel ❤️😈😈 ⚡
`;

        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/2iyu0h.jpeg` },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363407262029751@newsletter',
                    newsletterName: 'MARCEUSE-XMD❤️-2',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
