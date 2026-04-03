const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "nyoni",
    desc: "Show information about the developer",
    category: "main",
    react: "ℹ️",
    filename: __filename
}, async (conn, mek, m, { from, text }) => {
    try {
        
        const aboutBody = `
*╭═══〔 👤 BIOGRAPHY 〕═══╮*
┃
┃ ◦ *Lead Dev:* NICOLAUS DANIEL 
┃ ◦ *Real Name:* NICOLAUS
┃ ◦ *Nickname:* CM18
┃ ◦ *Age:* private issue😂😪
┃ ◦ *City:* pwani/kibaha
┃ ◦ *Role:* Passionate WhatsApp Dev
┃
*╰━━━━━━━━━━━━━━━━━━━━╯*

*╭═══〔 🛠️ DEVELOPMENT 〕═══╮*
┃
┃ ◦ *Project:* MARCEUSE-XMD
┃ ◦ *Collaborators:* 2 dev
┃ ◦ *Main Dev:* Nicolaus Daniel ❤️😈❤️
┃ ◦ *Status:* Active & Secure
┃
*╰━━━━━━━━━━━━━━━━━━━━╯*

> *“Coding is not just a hobby, it's a lifestyle.”*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Nicolaus Daniel ❤️😈❤️*
`;

        await conn.sendMessage(
            from,
            {
                image: { url: "https://files.catbox.moe/9gl0l8.jpg" },
                caption: aboutBody.trim(),
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363407262029751@newsletter',
                        newsletterName: "MARCEUSE-XMD ❤️ OFFICIAL",
                        serverMessageId: 1
                    },
                    externalAdReply: {
                        title: "MARCEUSE-XMD DEVELOPER INFO",
                        body: "MEET THE BRAIN BEHIND Nicolaus Daniel ❤️😈❤️",
                        mediaType: 1,
                        sourceUrl: "https://github.com/Raheem-cm/RAHEEM-XMD-3",
                        thumbnailUrl: "https://files.catbox.moe/9gl0l8.jpg",
                        renderLargerThumbnail: true,
                        showAdAttribution: true
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: "❌ About system error!" }, { quoted: mek });
    }
});
