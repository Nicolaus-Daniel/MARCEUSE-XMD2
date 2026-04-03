const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "fancy",
    alias: ["font", "style"],
    desc: "Convert text to fancy fonts.",
    category: "convert",
    react: "✍️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*Please provide text!* \n\n*Example:* .fancy Nicolaus Daniel");

        // Internal Logic for Fonts (More stable than API)
        const styles = {
            bold: (text) => text.split('').map(char => {
                const boldChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                const boldResult = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
                const index = boldChars.indexOf(char);
                return index > -1 ? boldResult[index * 2] + boldResult[index * 2 + 1] : char;
            }).join(''),
            mono: (text) => "```" + text + "```",
            italic: (text) => "_" + text + "_",
            cursive: (text) => text.split('').map(char => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                const cursy = "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃";
                const index = chars.indexOf(char);
                return index > -1 ? cursy[index * 2] + cursy[index * 2 + 1] : char;
            }).join(''),
            bubbles: (text) => text.split('').map(char => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                const bubs = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨";
                const index = chars.indexOf(char);
                return index > -1 ? bubs[index] : char;
            }).join('')
        };

        const resultText = `
*〔 FANCY TEXT GENERATOR 〕*

*Original:* ${q}

┃ ◦ *Bold:* ${styles.bold(q)}
┃ ◦ *Cursive:* ${styles.cursive(q)}
┃ ◦ *Bubbles:* ${styles.bubbles(q)}
┃ ◦ *Monospace:* ${styles.mono(q)}
┃ ◦ *Italic:* ${styles.italic(q)}

> *© MARCEUSE-XMD❤️-2 FANCY*
`;

        await conn.sendMessage(from, { 
            text: resultText.trim(),
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363407262029751@newsletter',
                    newsletterName: "MARCEUSE-XMD❤️-2 FANCY",
                    serverMessageId: 1
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error processing your text.");
    }
});
