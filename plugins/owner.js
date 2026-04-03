 const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    react: "🪀", 
    desc: "Get owner contact info (land-style)",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME;

        // --------- Multiple Styles ---------
        const styles = [

`╭───〔 👑 *OWNER CONTACT* 〕───╮
┃ 🌟 *Name*: ${ownerName}
┃ ☎️ *Number*: ${ownerNumber}
┃ 🛠️ *Bot*: ${config.BOT_NAME || 'MARCEUSE-XMD-2❤️'}
┃ 🕒 *Version*: 2.0.0 Beta
╰────────────────────────────╯

_📩 Tap on the contact card to save._
> *Powered by MARCEUSE-XMD❤️-2*`,

`┏━━ ⪨ *MARCEUSE-XMD❤️-2 OWNER INFO* ⪩━━┓
┃ 🧑‍💻 Name   : *${ownerName}*
┃ 📞 Contact : ${ownerNumber}
┃ ⚙️  Mode    : ${config.MODE}
┃ 🔖 Prefix  : ${config.PREFIX}
┗━━━━━━━━━━━━━━━━━━━━━━━┛
> _Contact with care, this is the real dev._`,

`▄▀▄▀▄ ${config.BOT_NAME || 'MARCEUSE-XMD❤️-2'} ▄▀▄▀▄
👑 *Owner:* ${ownerName}
📞 *Number:* ${ownerNumber}
🧠 *Role:* Lead Dev & Bot Creator
🔖 *Prefix:* ${config.PREFIX}
✨ *Version:* 2.0.0 Beta
━━━ Powered by Nicolaus Daniel ❤️😈😈 ━━━`
        ];

        // Random caption style
        const caption = styles[Math.floor(Math.random() * styles.length)];

        // VCard setup
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\nEND:VCARD`;

        // Send the vCard
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });

        // Send styled caption with image
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/a61zt4.jpg' },
            caption,
            contextInfo: {
                mentionedJid: [`${ownerNumber.replace('+', '')}@s.whatsapp.net`],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363407262029751@newsletter',
                    newsletterName: 'MARCEUSE-XMD❤️-2🪀',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Optional background audio
        await conn.sendMessage(from, {
            audio: { url: 'https://files.catbox.moe/t7ul1u.mp3' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: mek });
    }
});
