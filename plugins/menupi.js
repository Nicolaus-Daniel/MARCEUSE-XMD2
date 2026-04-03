const { cmd } = require('../command');

cmd({
    pattern: "menu4",
    react: "⚔️",
    category: "generated",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName }) => {
    try {
        
    const body = `╔════════════════════════╗\n  🔥 *MARCEUSE-XMD❤️-2* 🔥\n╚════════════════════════╝\n👤 *User:* ${pushName}\n📞 *Contact:* 255758575032\n\n*───「 INFO 」───*\n  Ping\n  alive\n  uptime\n  repo\n  Chr`;
    await conn.sendMessage(from, { text: body });
        await conn.sendMessage(from, { 
            contextInfo: {
                externalAdReply: {
                    title: "Kirikuu",
                    body: "Created by Nicolas Daniel 😈",
                    thumbnailUrl: " https://files.catbox.moe/8s7lxh.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vb6huZG30LKMFhAjNB3A",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } catch (e) { console.error(e); }
});
