const express = require('express');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = process.env.PAIR_PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Serve pairing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

// Global variables
let pairingCode = null;
let phoneNumber = null;
let socket = null;

// API to request pairing code
app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    if (!number || number.length < 10) {
        return res.json({ success: false, message: 'Invalid phone number' });
    }
    
    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (!cleanNumber.startsWith('255')) {
        return res.json({ success: false, message: 'Use format: 2557xxxxxx' });
    }
    
    phoneNumber = cleanNumber;
    
    try {
        // Initialize temporary socket for pairing
        const { state, saveCreds } = await useMultiFileAuthState('./pair-session');
        socket = makeWASocket({
            logger: P({ level: 'silent' }),
            printQRInTerminal: false,
            browser: Browsers.macOS('Firefox'),
            auth: state
        });
        
        socket.ev.on('creds.update', saveCreds);
        
        // Request pairing code
        setTimeout(async () => {
            try {
                const code = await socket.requestPairingCode(cleanNumber);
                pairingCode = code;
                console.log(`✅ Pairing code for ${cleanNumber}: ${code}`);
                
                // Send to client via another endpoint
            } catch (err) {
                console.error('Pairing error:', err);
            }
        }, 3000);
        
        // Wait for code to be generated
        let attempts = 0;
        while (pairingCode === null && attempts < 20) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        
        if (pairingCode) {
            return res.json({ success: true, code: pairingCode });
        } else {
            return res.json({ success: false, message: 'Could not generate code, retry' });
        }
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
});

// Get latest code
app.get('/api/latest-code', (req, res) => {
    res.json({ code: pairingCode });
});

app.listen(PORT, () => {
    console.log(`\n🔗 Pairing site running at: http://localhost:${PORT}`);
    console.log(`📱 Open this link in your browser to pair your WhatsApp bot\n`);
});