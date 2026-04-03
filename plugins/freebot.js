 const { cmd } = require('../command');

cmd({
    pattern: "freebot",
    alias: ["mortal", "deploy"],
    desc: "Get the MARCEUSE-XMD-2❤️ deployment link.",
    category: "main",
    react: "⚔️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const botLink = "https://nyoni-free-bot.onrender.com/";
        const imageUrl = "https://files.catbox.moe/8s7lxh.jpg";

        const messageContent = `
*MARCEUSE-XMD-2❤️* ⚔️
_t h e  u l t i m a t e  f r e e  b o t_

▫️ *Status:* \`Operational\` ✅
▫️ *Access:* \`Free for All\` 🔓
▫️ *Power:* \`Maximum Velocity\` 🚀

Click the link below to deploy your own instance of **MARCEUSE-XMD-2❤️** for free.

🔗 *Bot Link:* ${botLink}

> *powered by nicolaus Daniel 😈😈😈*
`;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: messageContent.trim(),
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363407262029751@newsletter',
                    newsletterName: "MARCEUSE-XMD-2❤️ UPDATES",
                    serverMessageId: 1
                },
                externalAdReply: {
                    title: "MARCEUSE-XMD-2❤️",
                    body: "Deploy Your Free Bot Now",
                    thumbnailUrl: imageUrl,
                    sourceUrl: botLink,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("❌ System Error: Link not found.");
    }
});
