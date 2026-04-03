 const { cmd } = require('../command');

cmd({
    pattern: "cf",
    desc: "Show creator's favorite things",
    react: "❤️",
    category: "info",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const creatorFavorites = `
❤️ *CREATOR FAVORITES*

*👑 Creator:* Nicolaus Daniel ❤️😈❤️
*📱 Phone:* +255758575032
*📷 Instagram:* https://www.instagram.com/nyoni.xmd?igsh=MTR3eWN5NnB3OTV0eg==

*⚽ Football Team:* SIMBA SC 🦁
*💻 Technology Field:* Creator & Design
*🎬 Movie Genre:* Action Movies

*🤖 Bot:* MARCEUSE-XMD ❤️
`;

        await reply(creatorFavorites);

    } catch (e) {
        console.error(e);
        await reply("Error showing favorites.");
    }
});
