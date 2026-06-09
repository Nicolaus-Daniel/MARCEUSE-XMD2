const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let pendingCode = null;

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MARCEUSE XMD - Pairing</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{
            background:linear-gradient(135deg,#0a0f1e,#0d1a2b);
            font-family:Arial,sans-serif;
            min-height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            padding:20px;
        }
        .card{
            background:rgba(10,20,35,0.9);
            border-radius:30px;
            padding:40px;
            max-width:450px;
            width:100%;
            text-align:center;
            border:1px solid #00ff88;
        }
        h1{color:#00ff88;margin-bottom:10px;}
        .sub{color:#aaa;margin-bottom:30px;}
        input{
            width:100%;
            padding:15px;
            margin:20px 0;
            border-radius:50px;
            border:none;
            background:#1e293b;
            color:white;
            text-align:center;
            font-size:16px;
            outline:none;
        }
        button{
            background:#00ff88;
            width:100%;
            padding:15px;
            border:none;
            border-radius:50px;
            font-weight:bold;
            cursor:pointer;
            font-size:16px;
            transition:0.3s;
        }
        button:hover{opacity:0.8;}
        .code-card{
            background:#0a0f1e;
            padding:20px;
            border-radius:20px;
            margin-top:20px;
            display:none;
        }
        .code-card span{
            font-size:28px;
            font-weight:bold;
            color:#00ff88;
            letter-spacing:4px;
        }
        .loading{display:none;color:#00ff88;margin:15px;}
        footer{margin-top:20px;font-size:12px;color:#555;}
    </style>
</head>
<body>
    <div class="card">
        <h1>🔗 MARCEUSE XMD</h1>
        <div class="sub">Unganisha Bot kwa Pairing Code</div>
        <input type="text" id="phone" placeholder="255758575032">
        <button onclick="requestPairing()">📲 Pata Pairing Code</button>
        <div id="loading" class="loading">⏳ Inaandaa code...</div>
        <div id="codeCard" class="code-card">
            <p>✅ PAIRING CODE YAKO:</p>
            <span id="codeDisplay">------</span>
            <p style="font-size:12px;margin-top:10px;">Inaisha baada ya dakika 1</p>
        </div>
        <footer>Owner: Nicolaus Daniel | +255758575032</footer>
    </div>
    <script>
        async function requestPairing(){
            let phone = document.getElementById('phone').value;
            if(!phone){
                alert('Weka namba yako kwa format 2557xxxxxx');
                return;
            }
            
            document.getElementById('loading').style.display='block';
            document.getElementById('codeCard').style.display='none';
            
            try{
                let res = await fetch('/api/pair',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({number:phone})
                });
                let data = await res.json();
                document.getElementById('loading').style.display='none';
                
                if(data.success){
                    document.getElementById('codeDisplay').innerText = data.code;
                    document.getElementById('codeCard').style.display='block';
                }else{
                    alert('Error: '+data.message);
                }
            }catch(e){
                document.getElementById('loading').style.display='none';
                alert('Server error. Hakikisha bot imeanza.');
            }
        }
    </script>
</body>
</html>
    `);
});

app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    
    if(!number || number.length < 10){
        return res.json({ success: false, message: 'Namba sahihi tafadhali' });
    }
    
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./pair-session');
        
        const conn = makeWASocket({
            logger: P({ level: 'silent' }),
            printQRInTerminal: false,
            browser: Browsers.macOS("Firefox"),
            auth: state
        });
        
        conn.ev.on('creds.update', saveCreds);
        
        let codeResult = null;
        
        conn.ev.on('connection.update', async (update) => {
            if(update.connection === 'open'){
                setTimeout(async () => {
                    try {
                        const code = await conn.requestPairingCode(cleanNumber);
                        codeResult = code;
                        console.log(`✅ Pairing code for ${cleanNumber}: ${code}`);
                        res.json({ success: true, code: code });
                    } catch(err) {
                        console.log('Error:', err);
                    }
                }, 2000);
            }
        });
        
        // Timeout after 20 seconds
        setTimeout(() => {
            if(!codeResult){
                res.json({ success: false, message: 'Timeout, jaribu tena' });
            }
        }, 20000);
        
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🌐 PAIRING SITE: http://localhost:${PORT}`);
    console.log(`📱 Fungua link hii kwenye browser yako`);
    console.log(`🔗 Kisha weka namba yako kupata pairing code\n`);
});
