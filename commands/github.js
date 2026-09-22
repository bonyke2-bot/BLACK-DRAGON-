const moment = require("moment-timezone");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function githubCommand(sock, chatId, message) {

function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "BONY-XMD"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD
VERSION:3.0
N:Bot;;;;
FN: BONY-XMD
END:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

try {
    const fkontak = createFakeContact(message);
    const pushname = message.pushName || "Unknown User";

    const res = await fetch("https://api.github.com/repos/bonyke2-bot/BONY-XMD");

    if (!res.ok) {
        throw new Error(`GitHub API Error: ${res.status}`);
    }

    const json = await res.json();

    const txt = `🚀 *BONY-XMD REPO INFO*

◦ *Name:* ${json.name}
◦ *Stars:* ${json.stargazers_count}
◦ *Forks:* ${json.forks_count}
◦ *Watchers:* ${json.watchers_count}
◦ *Size:* ${(json.size / 1024).toFixed(2)} MB
◦ *Updated:* ${moment(json.updated_at).format("DD/MM/YYYY HH:mm")}
◦ *Repo:* ${json.html_url}

*Description:*
${json.description || "No description"}

Hey ${pushname}, Thanks for using BONY-XMD Bot`;

    const imgPath = path.join(__dirname, "../assets/menu3.jpg");

    if (fs.existsSync(imgPath)) {
        const img = fs.readFileSync(imgPath);

        await sock.sendMessage(chatId, {
            image: img,
            caption: txt
        }, {
            quoted: fkontak
        });
    } else {
        await sock.sendMessage(chatId, {
            text: txt
        }, {
            quoted: fkontak
        });
    }

    await sock.sendMessage(chatId, {
        react: {
            text: "✅",
            key: message.key
        }
    });

} catch (error) {
    console.error("REPO ERROR:", error);

    await sock.sendMessage(chatId, {
        text: `❌ ${error.message}`
    }, {
        quoted: message
    });
}

}

module.exports = githubCommand;
