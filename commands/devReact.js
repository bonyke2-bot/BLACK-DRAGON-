
const settings = require('../settings');

const OWNER_NUMBERS = [
  String(settings.ownerNumber || '').replace(/\D/g, '')
].filter(Boolean);

const EMOJI = "🧸";

function normalizeJidToDigits(jid) {
  if (!jid) return "";
  const local = jid.split("@")[0];
  return local.replace(/\D/g, "");
}

function isOwnerNumber(num) {
  return OWNER_NUMBERS.some(owner =>
    num === owner ||
    num.endsWith(owner) ||
    num.includes(owner)
  );
}

async function sendReactionSafe(sock, remoteJid, msgKey, emoji) {
  try {
    await sock.sendMessage(remoteJid, {
      react: { text: emoji, key: msgKey }
    });
  } catch (e) {
    // If the first attempt fails (e.g. closed group, channel restriction),
    // retry using the raw relayMessage path which bypasses some permission checks
    try {
      const { proto } = require('@whiskeysockets/baileys');
      const reactionMsg = {
        reactionMessage: {
          key: msgKey,
          text: emoji,
          senderTimestampMs: Date.now()
        }
      };
      await sock.relayMessage(remoteJid, reactionMsg, {});
    } catch (_) {}
  }
}

async function handleDevReact(sock, msg) {
  try {
    if (!msg?.key || !msg.message) return;

    const remoteJid = msg.key.remoteJid || "";

    const isGroup     = remoteJid.endsWith("@g.us");
    const isChannel   = remoteJid.endsWith("@newsletter");
    const isDM        = remoteJid.endsWith("@s.whatsapp.net");

    // Work in groups (including closed groups), channels, and DMs
    if (!isGroup && !isChannel && !isDM) return;

    // Determine sender
    let rawSender;
    if (isGroup) {
      rawSender = msg.key.participant || msg.key.remoteJid;
    } else if (isChannel) {
      // Channel messages: participant holds the newsletter author JID
      rawSender = msg.key.participant || msg.key.remoteJid;
    } else {
      rawSender = msg.key.remoteJid;
    }

    const digits = normalizeJidToDigits(rawSender);
    if (!isOwnerNumber(digits)) return;

    // Clear any existing reaction first, then set the shield emoji
    await sendReactionSafe(sock, remoteJid, msg.key, "");
    await sendReactionSafe(sock, remoteJid, msg.key, EMOJI);

  } catch (_) {}
}

module.exports = handleDevReact;
