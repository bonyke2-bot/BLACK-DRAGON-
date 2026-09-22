const gis = require('g-i-s');

function gisSearch(query) {
    return new Promise((resolve, reject) => {
        gis(query, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

async function imageCommand(sock, chatId, message) {
    try {
        // Extract text from message
        const userMessage = message?.message?.conversation ||
                          message?.message?.extendedTextMessage?.text ||
                          '';

        const args = userMessage.split(' ').slice(1);
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `📷 *Image Search Command*\n\nUsage:\n.image <search_query>\n\nExample:\n.image cat\n.image beautiful sunset\n.image anime characters`
            });
        }

        await sock.sendMessage(chatId, {
            text: `🔍 Searching images for: "${query}"...`
        }, { quoted: message });

        const results = await gisSearch(query);

        if (!results || results.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `❌ No images found for "${query}"`
            });
        }

        const imageUrls = results
            .map(r => r.url)
            .filter(url => url && (url.endsWith('.jpg') || url.endsWith('.png')))
            .slice(0, 5);

        if (imageUrls.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `❌ No valid images found for "${query}"`
            });
        }

        const fancyBotName = `BONY-XMD`;

        for (const url of imageUrls) {
            try {
                await sock.sendMessage(chatId, {
                    image: { url },
                    caption: `📸 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐛𝐲 ${fancyBotName}`
                }, { quoted: message });

                await new Promise(res => setTimeout(res, 500));
            } catch (err) {
                console.error('Error sending image:', err);
            }
        }
    } catch (error) {
        console.error('Image command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ An unexpected error occurred. Please try again.'
        });
    }
}

module.exports = imageCommand;
