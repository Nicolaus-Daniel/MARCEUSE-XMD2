const { cmd } = require("../command");
const fetch = require("node-fetch");

cmd({
  pattern: 'ss',
  alias: ['ssweb'],
  react: '🖼',
  desc: "Download screenshot of a given link.",
  category: "other",
  use: ".ss <link>",
  filename: __filename
}, async (client, m, msg, { from, reply, q }) => {

  // Vérifie si un lien est fourni
  if (!q) {
    return reply("Please provide a URL to capture a screenshot.");
  }

  // Vérifie si l'URL commence bien par http:// ou https://
  if (!/^https?:\/\//.test(q)) {
    return reply("❗ Please provide a valid URL starting with http:// or https://");
  }

  // Fonction pour envoyer l'image
  const sendScreenshot = async (imageBuffer) => {
    return await client.sendMessage(from, {
      image: imageBuffer,
      caption: `*📸 Screenshot Tool*\n\n🌐 *URL:* ${q}\n\n> _*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Nicolaus Daniel😘*_`,
      contextInfo: {
        mentionedJid: [msg.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: " 120363407262029751@newsletter",
          newsletterName: "MARCEUSE-XMD-2❤️",
          serverMessageId: 143
        }
      }
    }, { quoted: msg });
  };

  try {
    // Appel API Zenz pour obtenir la capture d'écran
    const apiUrl = "https://zenz.biz.id/tools/ssweb?url=" + encodeURIComponent(q);
    const response = await fetch(apiUrl);

    const contentType = response.headers.get("content-type");

    // Si l’API renvoie directement une image
    if (contentType && contentType.startsWith("image/")) {
      const imageBuffer = await response.buffer();
      return await sendScreenshot(imageBuffer);
    }

    // Sinon, on récupère l’URL de l’image dans la réponse JSON
    const json = await response.json();
    if (!json.status || !json.result) {
      throw new Error("Failed to get screenshot");
    }

    const imageBuffer = await fetch(json.result).then(res => res.buffer());
    return await sendScreenshot(imageBuffer);

  } catch (error) {
    console.error(error);
    reply("❌ Failed to capture the screenshot. Please try again later.");
  }
});
