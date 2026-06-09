const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function startPairing() {
    console.log('\n╔════════════════════════════════════╗');
    console.log('║     MARCEUSE XMD - PAIRING TOOL    ║');
    console.log('║     Owner: Nicolaus Daniel         ║');
    console.log('╚════════════════════════════════════╝\n');
    
    rl.question('📱 Weka namba yako (2557xxxxxx): ', async (number) => {
        const phoneNumber = number.trim();
        
        if (!phoneNumber || phoneNumber.length < 10) {
            console.log('\n❌ Namba sahihi tafadhali! Mfano: 255758575032');
            process.exit(0);
        }
        
        console.log(`\n⏳ Inaandaa pairing code kwa ${phoneNumber}...\n`);
        
        const { state, saveCreds } = await useMultiFileAuthState('./pair-session');
        
        const conn = makeWASocket({
            logger: P({ level: 'silent' }),
            printQRInTerminal: false,
            browser: Browsers.macOS("Firefox"),
            auth: state
        });
        
        conn.ev.on('creds.update', saveCreds);
        
        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                setTimeout(async () => {
                    try {
                        const code = await conn.requestPairingCode(phoneNumber);
                        console.log('\n╔════════════════════════════════════╗');
                        console.log('║     🔐 PAIRING CODE YAKO 🔐         ║');
                        console.log(`║        ${code}        ║`);
                        console.log('╚════════════════════════════════════╝\n');
                        console.log('📌 JINSIA YA KUTUMIA:');
                        console.log('   1️⃣ Fungua WhatsApp');
                        console.log('   2️⃣ Settings → Linked Devices');
                        console.log('   3️⃣ Link a Device → Link with phone number');
                        console.log(`   4️⃣ Weka code: ${code}\n`);
                        console.log('💾 Baada ya kufanikiwa, credentials ziko kwenye folder "pair-session"');
                        console.log('📋 Kisha nakili "pair-session/creds.json" → "sessions/creds.json"\n');
                        
                        process.exit(0);
                    } catch (err) {
                        console.log('❌ Error:', err.message);
                        process.exit(0);
                    }
                }, 2000);
            }
            
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    console.log('🔄 Inaunganisha tena...');
                } else {
                    console.log('❌ Session imeisha. Futa folder pair-session na ujaribu tena.');
                    process.exit(0);
                }
            }
        });
    });
}

startPairing();
