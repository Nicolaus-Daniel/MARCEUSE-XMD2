const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function pairTerminal() {
    console.log('\n🤖 MARCEUSE XMD - Terminal Pairing\n');
    
    rl.question('📱 Weka namba yako (2557xxxxxx): ', async (number) => {
        const cleanNumber = number.trim();
        
        console.log(`⏳ Inaandaa pairing code kwa ${cleanNumber}...\n`);
        
        const { state, saveCreds } = await useMultiFileAuthState('./pair-session');
        const conn = makeWASocket({
            logger: P({ level: 'silent' }),
            printQRInTerminal: false,
            browser: Browsers.macOS('Firefox'),
            auth: state
        });
        
        conn.ev.on('creds.update', saveCreds);
        
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(cleanNumber);
                console.log(`\n✅ PAIRING CODE YAKO: ${code}\n`);
                console.log(`🔗 Jinsi ya kutumia:`);
                console.log(`   1. Fungua WhatsApp → Settings → Linked Devices`);
                console.log(`   2. Bonyeza "Link a Device" → "Link with phone number"`);
                console.log(`   3. Weka code: ${code}\n`);
                
                console.log(`💾 Baada ya pairing kufanikiwa, credentials zitawekwa kwenye folder 'pair-session/'`);
                console.log(`   Kisha nakili 'pair-session/creds.json' kwenda 'sessions/creds.json'\n`);
                
                rl.close();
            } catch (err) {
                console.error('❌ Error:', err.message);
                rl.close();
            }
        }, 3000);
    });
}

pairTerminal();