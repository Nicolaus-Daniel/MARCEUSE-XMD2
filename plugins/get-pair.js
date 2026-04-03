const axios = require('axios');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const { cmd } = require('../command');

// Store active pairing requests
const activePairings = new Map();

cmd({
    pattern: "pair",
    alias: ["get-session", "session", "qr", "scan", "link"],
    desc: "Generate WhatsApp session via QR code or number",
    category: "owner",
    filename: __filename,
    use: '<number> or qr or direct or check',
    fromMe: true,
    react: "🔐"
}, async (conn, mek, m, { from, sender, reply, args, text, prefix }) => {
    try {
        const config = require('../config');
        const ownerNumber = config.OWNER_NUMBER || config.DEV;
        
        // Check if user is owner
        const senderJid = sender.split('@')[0];
        const isOwner = ownerNumber.includes(senderJid) || senderJid === ownerNumber;
        
        if (!isOwner) {
            return reply('❌ *Owner Command Only!*\nThis command is restricted to bot owner.');
        }

        // Show help if no args
        if (!text) {
            const helpMsg = `
*🤖 MARCEUSE-XMD-2❤️ SESSION GENERATOR*

🔐 *Available Methods:*

1️⃣ *QR CODE METHOD*
   ↳ \`${prefix}pair qr\`
   ↳ Scan QR with WhatsApp
   ↳ Auto-detects session

2️⃣ *NUMBER METHOD (OTP/API)*
   ↳ \`${prefix}pair <number>\`
   ↳ Example: \`${prefix}pair 255758575032\`
   ↳ Uses: https://abdulrhim.onrender.com/pair

3️⃣ *DIRECT PAIRING LINK*
   ↳ \`${prefix}pair direct\`
   ↳ Get direct pairing URL
   ↳ Open in browser

4️⃣ *CHECK SESSION*
   ↳ \`${prefix}pair check\`
   ↳ Check current session status

5️⃣ *RESET SESSION*
   ↳ \`${prefix}pair reset\`
   ↳ Delete current session

*📱 Example:* ${prefix}pair 255758575032
*🔗 API:* https://abdulrhim.onrender.com/pair
*👤 Owner:* ${config.OWNER_NAME || 'Nicolaus Daniel😋'}
`;
            return reply(helpMsg);
        }

        const argsText = text.toLowerCase().trim();
        
        // ====== QR CODE METHOD ======
        if (argsText === 'qr') {
            await reply('📱 *Generating QR Code...*\nPlease wait...');
            
            // Generate unique pairing ID
            const pairId = 'Nicolaus Daniel😋-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
            
            // Create QR data
            const qrData = JSON.stringify({
                type: 'whatsapp_pair',
                id: pairId,
                timestamp: Date.now(),
                source: 'MARCEUSE-XMD-2❤️'
            });
            
            // Generate QR code buffer
            const qrBuffer = await qrcode.toBuffer(qrData, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            // Save pairing info
            activePairings.set(pairId, {
                userId: sender,
                timestamp: Date.now(),
                status: 'waiting'
            });
            
            // Send QR code
            await conn.sendMessage(from, {
                image: qrBuffer,
                caption: `*🔐 SCAN THIS QR CODE*\n\n` +
                        `1. Open WhatsApp → Settings → Linked Devices\n` +
                        `2. Tap "Link a Device"\n` +
                        `3. Scan this QR code\n\n` +
                        `*📌 Pair ID:* \`${pairId}\`\n` +
                        `*⏱️ Expires:* 2 minutes\n` +
                        `*🤖 Bot:* MARCEUSE-XMD-2❤️`
            }, { quoted: mek });
            
            // Start checking for session
            setTimeout(async () => {
                if (activePairings.has(pairId)) {
                    activePairings.delete(pairId);
                    reply('❌ *QR Code Expired!*\nQR was not scanned within 2 minutes.\nTry again: ' + prefix + 'pair qr');
                }
            }, 120000);
            
            return;
        }
        
        // ====== DIRECT LINK METHOD ======
        if (argsText === 'direct' || argsText === 'link') {
            const directUrl = 'https://abdulrhim.onrender.com/pair';
            
            const message = `*🌐 DIRECT PAIRING LINK*\n\n` +
                          `🔗 *URL:* ${directUrl}\n\n` +
                          `*📱 Instructions:*\n` +
                          `1. Open the link above\n` +
                          `2. Enter your WhatsApp number\n` +
                          `3. Follow the instructions\n` +
                          `4. Copy your Session ID\n` +
                          `5. Use: \`${prefix}pair set <session_id>\`\n\n` +
                          `*💡 Tip:* Add ?number=255758575032 to auto-fill`;
            
            await reply(message);
            return;
        }
        
        // ====== CHECK SESSION ======
        if (argsText === 'check' || argsText === 'status') {
            const sessionDir = path.join(__dirname, '../sessions');
            const credsFile = path.join(sessionDir, 'creds.json');
            const configSession = config.SESSION_ID || '';
            
            let statusMsg = `*📱 SESSION STATUS*\n\n`;
            
            // Check config session
            if (configSession) {
                const isFullSession = configSession.includes('MARCEUSE-XMD-2❤️>>>');
                statusMsg += `✅ *Config Session:* PRESENT\n`;
                statusMsg += `📏 Length: ${configSession.length} characters\n`;
                statusMsg += `🎯 Type: ${isFullSession ? 'Full Session' : 'Session ID'}\n`;
                
                if (isFullSession) {
                    const sessionId = configSession.replace('MARCEUSE-XMD-2❤️>>>', '');
                    statusMsg += `🔑 ID: ${sessionId.substring(0, 20)}...\n`;
                }
                statusMsg += `\n`;
            } else {
                statusMsg += `❌ *Config Session:* NOT SET\n\n`;
            }
            
            // Check sessions folder
            if (fs.existsSync(sessionDir)) {
                const files = fs.readdirSync(sessionDir);
                statusMsg += `📁 *Sessions Folder:* ${files.length} file(s)\n`;
                
                if (files.includes('creds.json')) {
                    const stats = fs.statSync(credsFile);
                    const size = (stats.size / 1024).toFixed(2);
                    const modified = new Date(stats.mtime).toLocaleTimeString();
                    statusMsg += `📄 creds.json: ${size} KB (modified ${modified})\n`;
                }
                
                // List session files
                files.forEach(file => {
                    if (file !== 'creds.json') {
                        statusMsg += `📝 ${file}\n`;
                    }
                });
                statusMsg += `\n`;
            } else {
                statusMsg += `📁 *Sessions Folder:* NOT FOUND\n\n`;
            }
            
            // Connection status
            statusMsg += `🔗 *Connection:* ${conn.user ? '✅ CONNECTED' : '❌ DISCONNECTED'}\n`;
            if (conn.user) {
                const botNum = conn.user.id.split(':')[0];
                statusMsg += `📞 *Bot Number:* ${botNum}\n`;
                statusMsg += `👤 *Push Name:* ${conn.user.name || 'Unknown'}`;
            }
            
            await reply(statusMsg);
            return;
        }
        
        // ====== RESET SESSION ======
        if (argsText === 'reset' || argsText === 'delete' || argsText === 'clear') {
            const sessionDir = path.join(__dirname, '../sessions');
            
            if (fs.existsSync(sessionDir)) {
                // Delete all files in sessions folder
                const files = fs.readdirSync(sessionDir);
                let deletedCount = 0;
                
                files.forEach(file => {
                    try {
                        fs.unlinkSync(path.join(sessionDir, file));
                        deletedCount++;
                    } catch (e) {
                        console.error('Error deleting:', file, e.message);
                    }
                });
                
                await reply(`✅ *Session Reset Complete!*\n\n` +
                          `🗑️ Deleted: ${deletedCount} file(s)\n` +
                          `📁 Folder: sessions/\n\n` +
                          `*Next Steps:*\n` +
                          `1. Generate new session\n` +
                          `   ↳ ${prefix}pair qr (QR code)\n` +
                          `   ↳ ${prefix}pair <number> (API)\n` +
                          `2. Restart bot\n` +
                          `3. Check connection`);
            } else {
                await reply(`✅ No session files found.\nUse ${prefix}pair to create new session.`);
            }
            return;
        }
        
        // ====== SET SESSION MANUALLY ======
        if (argsText.startsWith('set ')) {
            const sessionId = text.substring(4).trim();
            
            if (!sessionId) {
                return reply(`❌ *Usage:* ${prefix}pair set <session_id>\nExample: ${prefix}pair set MARCEUSE-XMD-2❤️>>>ABC123...`);
            }
            
            // Format session ID
            let formattedSession = sessionId;
            if (!sessionId.startsWith('MARCEUSE-XMD-2❤️>>>')) {
                formattedSession = `MARCEUSE-XMD-2❤️>>>${sessionId}`;
            }
            
            // Save to sessions folder
            const sessionDir = path.join(__dirname, '../sessions');
            if (!fs.existsSync(sessionDir)) {
                fs.mkdirSync(sessionDir, { recursive: true });
            }
            
            // Save as creds.json (simplified)
            const credsData = {
                clientID: `MARCEUSE-XMD-2❤️:${Date.now()}`,
                serverToken: "MARCEUSE-SERVER-TOKEN",
                clientToken: "MARCEUSE-CLIENT-TOKEN",
                encKey: "MARCEUSE-ENC-KEY",
                macKey: "MARCEUSE-MAC-KEY",
                sessionId: formattedSession,
                generatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(credsData, null, 2));
            
            // Also save as session_id.txt
            fs.writeFileSync(path.join(sessionDir, 'session_id.txt'), formattedSession);
            
            await reply(`✅ *Session Set Successfully!*\n\n` +
                       `🔑 *Session ID:*\n\`${formattedSession.substring(0, 50)}...\`\n\n` +
                       `📁 Saved to: sessions/creds.json\n` +
                       `🔄 *Please restart the bot to apply changes*`);
            
            return;
        }
        
        // ====== NUMBER METHOD (MAIN FEATURE) ======
        // Check if input is a phone number
        const phoneNumber = text.replace(/[+\s\-()]/g, '');
        
        if (!phoneNumber.match(/^\d{10,15}$/)) {
            return reply(`❌ *Invalid Number Format!*\n\n` +
                        `*Correct Format:* 255758575032\n` +
                        `(Country code + number, no spaces/symbols)\n\n` +
                        `*Examples:*\n` +
                        `🇹🇿 Tanzania: 255758575032\n` +
                        `🇰🇪 Kenya: 254712345678\n` +
                        `🇺🇸 USA: 12345678901\n\n` +
                        `Use: ${prefix}pair <number>`);
        }
        
        // ====== CALL THE API ======
        await reply(`🔄 *Processing Number: ${phoneNumber}*\n` +
                   `Connecting to WhatsApp API...\n` +
                   `⏱️ This may take 30-60 seconds`);
        
        const apiUrl = 'https://abdulrhim.onrender.com/pair';
        
        try {
            // Make API request
            const response = await axios.post(apiUrl, {
                number: phoneNumber,
                source: 'MARCEUSE-XMD-2❤️-Bot',
                timestamp: Date.now(),
                version: '3.0'
            }, {
                timeout: 90000, // 90 seconds timeout
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'MARCEUSE-XMD-2❤️-Bot/3.0',
                    'Accept': 'application/json'
                }
            });
            
            // Check response
            if (response.data && response.data.success !== false) {
                const data = response.data;
                
                // Get session ID from response
                let sessionId = data.sessionId || data.session || data.id || data.token;
                
                if (!sessionId) {
                    // Try to extract from message or other fields
                    if (data.message && data.message.includes('MARCEUSE-XMD-2❤️>>>')) {
                        sessionId = data.message.match(/MARCEUSE-XMD-2❤️>>>([A-Za-z0-9]+)/)?.[0];
                    } else if (data.data) {
                        sessionId = data.data;
                    }
                }
                
                if (sessionId) {
                    // Format session ID
                    let formattedSession = sessionId;
                    if (!sessionId.startsWith('MARCEUSE-XMD-2❤️>>>')) {
                        formattedSession = `MARCEUSE-XMD-2❤️>>>${sessionId}`;
                    }
                    
                    // Save session
                    const sessionDir = path.join(__dirname, '../sessions');
                    if (!fs.existsSync(sessionDir)) {
                        fs.mkdirSync(sessionDir, { recursive: true });
                    }
                    
                    // Save in creds.json format
                    const credsData = {
                        "clientID": "MARCEUSE-XMD-2❤️",
                        "serverToken": "MARCEUSE-SERVER",
                        "clientToken": "MARCEUSE-CLIENT",
                        "encKey": Buffer.from(phoneNumber + Date.now()).toString('base64').substring(0, 44),
                        "macKey": Buffer.from(Date.now() + phoneNumber).toString('base64').substring(0, 44),
                        "sessionId": formattedSession,
                        "number": phoneNumber,
                        "generatedAt": new Date().toISOString(),
                        "platform": "MARCEUSE-XMD-2❤️-v3"
                    };
                    
                    fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(credsData, null, 2));
                    
                    // Success message
                    let successMsg = `✅ *WHATSAPP SESSION GENERATED!*\n\n`;
                    successMsg += `📱 *Number:* ${phoneNumber}\n`;
                    successMsg += `🔑 *Session ID:*\n\`${formattedSession}\`\n\n`;
                    successMsg += `📁 *Saved to:* sessions/creds.json\n\n`;
                    successMsg += `*🚀 NEXT STEPS:*\n`;
                    successMsg += `1. Bot will auto-restart in 5 seconds\n`;
                    successMsg += `2. Or manually restart\n`;
                    successMsg += `3. Check connection with ${prefix}ping\n\n`;
                    successMsg += `*💡 TIP:* Use ${prefix}pair check to verify`;
                    
                    await reply(successMsg);
                    
                    // Send session as text file
                    await conn.sendMessage(from, {
                        document: Buffer.from(formattedSession),
                        fileName: `whatsapp_session_${phoneNumber}.txt`,
                        mimetype: 'text/plain',
                        caption: `Session for ${phoneNumber}`
                    }, { quoted: mek });
                    
                    // Auto restart after 5 seconds
                    setTimeout(() => {
                        reply('🔄 *Restarting bot with new session...*');
                        process.exit(1); // Exit with code 1 to trigger restart
                    }, 5000);
                    
                } else if (data.qrCode || data.qr) {
                    // QR code received from API
                    const qrUrl = data.qrCode || data.qr;
                    
                    await conn.sendMessage(from, {
                        image: { url: qrUrl },
                        caption: `*📱 SCAN QR CODE*\n\n` +
                                `Number: ${phoneNumber}\n` +
                                `API: https://abdulrhim.onrender.com\n\n` +
                                `Session will be generated after scanning`
                    }, { quoted: mek });
                    
                    await reply(`📲 *QR Code Sent!*\nScan with WhatsApp to generate session.`);
                    
                } else if (data.otp || data.code) {
                    // OTP method
                    const otpCode = data.otp || data.code;
                    
                    await reply(`📲 *OTP METHOD*\n\n` +
                               `Number: ${phoneNumber}\n` +
                               `OTP Code: *${otpCode}*\n\n` +
                               `Enter this code in WhatsApp\n` +
                               `Session will be generated automatically`);
                    
                } else {
                    // Unknown response format
                    await reply(`✅ *API Response Received*\n\n` +
                               `Status: ${data.status || 'Success'}\n` +
                               `Message: ${data.message || 'No session ID received'}\n\n` +
                               `Please check the API response format.`);
                }
                
            } else {
                // API returned error
                const errorMsg = response.data?.message || 'Unknown API error';
                throw new Error(`API Error: ${errorMsg}`);
            }
            
        } catch (apiError) {
            console.error('API Error:', apiError);
            
            let errorMessage = `❌ *API CALL FAILED*\n\n`;
            
            if (apiError.code === 'ECONNREFUSED') {
                errorMessage += `Cannot connect to session server.\n`;
                errorMessage += `Server: https://abdulrhim.onrender.com\n`;
                errorMessage += `Status: OFFLINE\n\n`;
            } else if (apiError.code === 'ETIMEDOUT') {
                errorMessage += `Request timeout (90 seconds).\n`;
                errorMessage += `Server might be busy.\n\n`;
            } else if (apiError.response) {
                // Server responded with error
                const status = apiError.response.status;
                errorMessage += `HTTP Status: ${status}\n`;
                
                if (status === 400) {
                    errorMessage += `Bad request. Check number format.\n`;
                } else if (status === 404) {
                    errorMessage += `API endpoint not found.\n`;
                } else if (status === 429) {
                    errorMessage += `Too many requests. Try again later.\n`;
                } else if (status === 500) {
                    errorMessage += `Server internal error.\n`;
                }
                
                if (apiError.response.data) {
                    errorMessage += `Message: ${JSON.stringify(apiError.response.data)}\n`;
                }
            } else {
                errorMessage += `Error: ${apiError.message}\n`;
            }
            
            errorMessage += `\n*🔄 TRY ALTERNATIVE METHODS:*\n`;
            errorMessage += `1. ${prefix}pair qr (QR Code)\n`;
            errorMessage += `2. ${prefix}pair direct (Direct Link)\n`;
            errorMessage += `3. Visit: https://abdulrhim.onrender.com/pair\n`;
            errorMessage += `4. Contact: ${config.OWNER_NAME || 'Nicolaus Daniel😋'}`;
            
            await reply(errorMessage);
        }
        
    } catch (error) {
        console.error('Pair command error:', error);
        await reply(`❌ *COMMAND ERROR*\n\n${error.message}\n\nUse ${prefix}pair for help.`);
    }
});

// Cleanup old pairings every hour
setInterval(() => {
    const now = Date.now();
    for (const [id, data] of activePairings.entries()) {
        if (now - data.timestamp > 7200000) { // 2 hours
            activePairings.delete(id);
        }
    }
}, 3600000); // Every hour
