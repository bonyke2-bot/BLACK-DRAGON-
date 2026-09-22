const fs = require("fs");
const path = require("path");
const os = require("os");

async function menuCommand(sock, chatId, message) {
    try {
        const pushname = message.pushName || "User";

        const menuText = `
╭━━〔 *BONY-XMD* 〕━━⬣
┃ 👤 User: ${pushname}
┃ 🤖 Bot: BONY-XMD
┃ ⏰ Time: ${new Date().toLocaleTimeString()}
┃ 📅 Date: ${new Date().toLocaleDateString()}
┃ 💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
┃ 🖥 Platform: ${os.platform()}
╰━━━━━━━━━━━━━━⬣

╭━━〔 MAIN MENU 〕━━⬣
┃ .alive
┃ .ping
┃ .owner
┃ .menu
┃ .repo
┃ .settings
┃ .botinfo
┃ .help
╰━━━━━━━━━━━━━━⬣

╭━━〔 DOWNLOAD 〕━━⬣
┃ .play
┃ .song
┃ .video
┃ .tiktok
┃ .facebook
┃ .instagram
┃ .spotify
╰━━━━━━━━━━━━━━⬣

╭━━〔 AI MENU 〕━━⬣
┃ .ai
┃ .gpt4
┃ .deepseek
┃ .copilot
┃ .grok
┃ .blackbox
┃ .vision
╰━━━━━━━━━━━━━━⬣

╭━━〔 GROUP MENU 〕━━⬣
┃ .tagall
┃ .hidetag
┃ .kick
┃ .add
┃ .promote
┃ .demote
┃ .mute
┃ .unmute
╰━━━━━━━━━━━━━━⬣

> © bony Hub
`;

        const imagePath = path.join(__dirname, "../assets/menu3.jpg");

        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(
                chatId,
                {
                    image: fs.readFileSync(imagePath),
                    caption: menuText
                },
                {
                    quoted: message
                }
            );
        } else {
            await sock.sendMessage(
                chatId,
                {
                    text: menuText
                },
                {
                    quoted: message
                }
            );
        }

    } catch (err) {
        console.log(err);
        await sock.sendMessage(chatId, {
            text: "❌ Error displaying menu."
        });
    }
}

module.exports = menuCommand;
