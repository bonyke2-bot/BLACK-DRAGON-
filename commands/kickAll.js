const { createFakeContact } = require('../lib/fakeContact');
const isAdmin = require('../lib/isAdmin');

function normaliseJid(jid) {
    if (!jid) return jid;
    if (typeof jid !== 'string') return String(jid);
    let [user] = jid.split('@');
    if (user.includes(':')) user = user.split(':')[0];
    return `${user}@s.whatsapp.net`;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function kickAllCommand(sock, chatId, message, senderId) {
    // Validate required parameters
    if (!sock || !chatId || !message) {
        console.error('Missing required parameters');
        return;
    }

    const fake = createFakeContact(message);

    try {
        // Ensure chatId is a string
        const groupId = String(chatId);

        if (!groupId.endsWith('@g.us')) {
            await sock.sendMessage(groupId, {
                react: { text: '❌', key: message.key }
            }).catch(() => {});

            return await sock.sendMessage(groupId, {
                text: '🚫 This command only works in groups.'
            }, { quoted: fake }).catch(() => {});
        }

        // Get group metadata with error handling
        let metadata;
        try {
            metadata = await sock.groupMetadata(groupId);
        } catch (error) {
            console.error('Failed to get group metadata:', error);
            await sock.sendMessage(groupId, {
                react: { text: '❌', key: message.key }
            }).catch(() => {});

            return await sock.sendMessage(groupId, {
                text: '❌ Failed to fetch group information. Make sure I\'m in the group.'
            }, { quoted: fake }).catch(() => {});
        }

        const participants = metadata.participants || [];

        // Get bot's JID with proper error handling
        let botJid;
        try {
            botJid = normaliseJid(sock.user?.id);
            if (!botJid) throw new Error('Could not determine bot JID');
        } catch (error) {
            console.error('Failed to get bot JID:', error);
            return await sock.sendMessage(groupId, {
                text: '❌ Bot identification failed.'
            }, { quoted: fake }).catch(() => {});
        }

        const senderNorm = normaliseJid(senderId);

        // Check if bot is admin
        const isBotAdmin = participants.some(p => {
            try {
                return p && normaliseJid(p.id) === botJid &&
                       (p.admin === 'admin' || p.admin === 'superadmin');
            } catch {
                return false;
            }
        });

        if (!isBotAdmin) {
            await sock.sendMessage(groupId, {
                react: { text: '❌', key: message.key }
            }).catch(() => {});

            return await sock.sendMessage(groupId, {
                text: '🚫 I need to be an admin to use .kickall.'
            }, { quoted: fake }).catch(() => {});
        }

        // Check if sender is admin
        let isSenderAdmin = false;
        try {
            isSenderAdmin = await isAdmin(sock, groupId, senderId);
        } catch (error) {
            console.error('Failed to check sender admin status:', error);
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(groupId, {
                react: { text: '❌', key: message.key }
            }).catch(() => {});

            return await sock.sendMessage(groupId, {
                text: '🚫 Only group admins can use .kickall.'
            }, { quoted: fake }).catch(() => {});
        }

        // Filter targets with better error handling
        const targets = participants
            .filter(p => {
                try {
                    if (!p || !p.id) return false;
                    const norm = normaliseJid(p.id);
                    return (
                        norm &&
                        norm !== botJid &&
                        norm !== senderNorm &&
                        p.admin !== 'admin' &&
                        p.admin !== 'superadmin'
                    );
                } catch {
                    return false;
                }
            })
            .map(p => p.id)
            .filter(Boolean); // Remove any undefined/null values

        if (targets.length === 0) {
            await sock.sendMessage(groupId, {
                react: { text: '⚠️', key: message.key }
            }).catch(() => {});

            return await sock.sendMessage(groupId, {
                text: '⚠️ No non-admin members to kick.'
            }, { quoted: fake }).catch(() => {});
        }

        // Send initial messages
        await sock.sendMessage(groupId, {
            react: { text: '⏳', key: message.key }
        }).catch(() => {});

        await sock.sendMessage(groupId, {
            text: `⏳ Kicking *${targets.length}* member(s), please wait...`
        }, { quoted: fake }).catch(() => {});

        let kicked = 0;
        let failed = 0;
        const failedJids = [];

        // Process kicks with better error handling
        for (const jid of targets) {
            try {
                if (!jid) {
                    failed++;
                    continue;
                }

                await sock.groupParticipantsUpdate(groupId, [jid], 'remove');
                kicked++;
            } catch (error) {
                console.error(`Failed to kick ${jid}:`, error.message);
                failed++;
                failedJids.push(jid);
            }

            // Add delay between kicks to avoid rate limiting
            await sleep(700);
        }

        // Prepare summary message
        let summary;
        if (failed > 0) {
            summary = `✅ Kicked *${kicked}/${targets.length}* member(s).\n⚠️ ${failed} could not be removed`;
            if (failedJids.length > 0 && failedJids.length <= 3) {
                // Show first few failed JIDs for debugging
                summary += `\nFailed JIDs: ${failedJids.join(', ')}`;
            }
        } else {
            summary = `✅ Successfully kicked all *${kicked}* member(s).`;
        }

        // Send final messages
        await sock.sendMessage(groupId, {
            react: { text: kicked > 0 ? '✅' : '⚠️', key: message.key }
        }).catch(() => {});

        return await sock.sendMessage(groupId, {
            text: summary
        }, { quoted: fake }).catch(() => {});

    } catch (err) {
        console.error('kickAllCommand error:', err);

        try {
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message?.key }
            }).catch(() => {});

            return await sock.sendMessage(chatId, {
                text: `❌ Error: ${err?.message || 'Unknown error occurred'}`
            }, { quoted: fake }).catch(() => {});
        } catch (finalError) {
            console.error('Failed to send error message:', finalError);
        }
    }
}

module.exports = kickAllCommand;
