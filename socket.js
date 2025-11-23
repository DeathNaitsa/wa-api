import { startSession, onMessage, sendText, client, getAllSessionsInfo, getGlobalStats, countReceivedMessage } from './nishi-wa-api-new/src/index.js';

// Start sessions
await startSession('bot');
await startSession('bot2');

// Command lock to prevent duplicate execution
const commandLocks = new Map();

async function acquireLock(key, timeoutMs = 5000) {
    const now = Date.now();
    const existing = commandLocks.get(key);
    
    // Check if already locked
    if (existing && now - existing < timeoutMs) {
        return false; // Lock already held
    }
    
    // Acquire lock
    commandLocks.set(key, now);
    return true;
}

function releaseLock(key) {
    commandLocks.delete(key);
}

// Chat assignment system (only in this bot implementation)
const chatAssignments = new Map(); // chatId -> sessionId

function assignChat(chatId, sessionId) {
    const sessions = client.getAllSessions();
    if (!sessions.includes(sessionId)) {
        throw new Error(`Session '${sessionId}' not found`);
    }
    chatAssignments.set(chatId, sessionId);
    console.log(`📞 Chat ${chatId} assigned to ${sessionId}`);
}

function getChatAssignment(chatId) {
    return chatAssignments.get(chatId);
}

function autoAssignChat(chatId, preferredSessionId) {
    const assignedSession = chatAssignments.get(chatId);
    const sessions = client.getAllSessions();
    
    // Auto-assign if not assigned or assigned session is offline
    if (!assignedSession || !sessions.includes(assignedSession)) {
        // Prefer the session that received the message
        const newSession = sessions.includes(preferredSessionId) ? preferredSessionId : sessions[0];
        if (newSession) {
            chatAssignments.set(chatId, newSession);
            console.log(`📞 Chat ${chatId} auto-assigned to ${newSession}`);
            return newSession;
        }
    }
    
    return assignedSession;
}

function isAssignedToSession(chatId, sessionId) {
    const assignedSession = autoAssignChat(chatId, sessionId);
    return assignedSession === sessionId;
}

console.log('\n📱 WhatsApp Bot läuft!');
console.log('WhatsApp Befehle:');
console.log('  !ping              - Bot testen (nur diese Session)');
console.log('  !ping all          - Alle Sessions testen');
console.log('  !info              - Nachrichteninfo anzeigen');
console.log('  !liste             - Alle Sessions auflisten');
console.log('  !stats             - Detaillierte Session-Statistiken');
console.log('  !gesamtstats       - Gesamtstatistik aller Sessions');
console.log('  !neustart <id>     - Session neu starten');
console.log('  !pause <id>        - Session pausieren');
console.log('  !fortsetzen <id>   - Session fortsetzen');
console.log('  !stopp <id>        - Session stoppen');
console.log('  !löschen <id>      - Session-Daten löschen');
console.log('  !start <id>        - Neue Session starten');
console.log('  !zuweisen <id>     - Diesen Chat einer Session zuweisen');
console.log('  !zuweisungen       - Alle Chat-Zuweisungen anzeigen\n');

// WhatsApp message handler
onMessage(async (msg) => {
    // Ignore own messages
    if (msg.fromMe) return;

    // Check if this message is assigned to this session
    if (!isAssignedToSession(msg.from, msg.sessionId)) {
        const assignedTo = getChatAssignment(msg.from);
        console.log(`⏭️  Skipping message for ${msg.from} (assigned to ${assignedTo})`);
        return;
    }

    // Count this message (only for assigned session to avoid duplicates)
    countReceivedMessage(msg.sessionId);

    // Mark when we received and started processing this message
    const messageProcessingStart = Date.now();

    const [cmd, ...args] = msg.message.trim().split(' ');
    const targetSession = args[0];
    
    // Helper to safely send messages
    const safeSend = async (text) => {
        try {
            const sessions = client.getAllSessions();
            if (sessions.includes(msg.sessionId)) {
                await sendText(msg.sessionId, msg.from, text);
            }
        } catch (e) {
            console.error('Could not send message:', e.message);
        }
    };

    try {
        switch (cmd) {
            case '!ping':
                if (targetSession === 'all') {
                    // Test all sessions
                    const allSessions = client.getAllSessions();
                    let pingMessage = '🏓 *Ping Test - Alle Sessions*\n\n';
                    
                    for (const sid of allSessions) {
                        const sessionSendStart = Date.now();
                        try {
                            // Send test message and measure time
                            await sendText(sid, msg.from, '🏓 Ping...');
                            const sendTime = Date.now() - sessionSendStart;
                            pingMessage += `🟢 *${sid}*: ${sendTime}ms\n`;
                        } catch (e) {
                            pingMessage += `🔴 *${sid}*: Fehler\n`;
                        }
                    }
                    
                    // Final summary message
                    const totalLatency = Date.now() - messageProcessingStart;
                    pingMessage += `\n⏱️ Gesamt: ${totalLatency}ms`;
                    await sendText(msg.sessionId, msg.from, pingMessage);
                } else {
                    // Only test current session - measure send time
                    const sendStart = Date.now();
                    await sendText(msg.sessionId, msg.from, `🏓 Pong!`);
                    const sendTime = Date.now() - sendStart;
                    const totalLatency = Date.now() - messageProcessingStart;
                    
                    // Send detailed timing
                    const timingInfo = `⏱️ Verarbeitung: ${totalLatency}ms\n📤 Sendezeit: ${sendTime}ms`;
                    await sendText(msg.sessionId, msg.from, timingInfo);
                }
                break;
            
            case '!info':
                const info = `📱 *Session Info*\n\nSession: ${msg.sessionId}\nVon: ${msg.from}\nName: ${msg.name}\nGruppe: ${msg.isGroup ? 'Ja' : 'Nein'}\nTyp: ${msg.type}\nZeitstempel: ${new Date(msg.timestamp * 1000).toLocaleString('de-DE')}`;
                await sendText(msg.sessionId, msg.from, info);
                break;

            case '!liste':
                const sessions = client.getAllSessions();
                const response = sessions.length 
                    ? `📋 *Aktive Sessions:*\n\n${sessions.map(s => `• ${s}`).join('\n')}` 
                    : '❌ Keine aktiven Sessions';
                await sendText(msg.sessionId, msg.from, response);
                break;

            case '!stats':
                const allStats = getAllSessionsInfo();
                
                if (allStats.length === 0) {
                    await safeSend('❌ Keine Sessions vorhanden');
                    break;
                }

                let statsMessage = '📊 *Session Statistiken*\n\n';
                
                for (const stat of allStats) {
                    const statusEmoji = stat.isActive ? '🟢' : 
                                       stat.status === 'stopped' ? '🔴' : 
                                       stat.status === 'paused' ? '⏸️' : '⚪';
                    
                    const statusText = stat.isActive ? 'Aktiv' :
                                      stat.status === 'stopped' ? 'Gestoppt' :
                                      stat.status === 'paused' ? 'Pausiert' :
                                      stat.status === 'connecting' ? 'Verbindet...' :
                                      stat.status === 'disconnected' ? 'Getrennt' :
                                      stat.status;

                    const totalMsgs = (stat.messagesReceived || 0) + (stat.messagesSent || 0);
                    
                    statsMessage += `${statusEmoji} *${stat.sessionId}*\n`;
                    statsMessage += `├─ Status: ${statusText}\n`;
                    statsMessage += `├─ Uptime: ${stat.uptimeFormatted}\n`;
                    statsMessage += `├─ Neustarts: ${stat.restartCount}\n`;
                    statsMessage += `└─ Nachrichten: ${totalMsgs} (↓${stat.messagesReceived || 0} / ↑${stat.messagesSent || 0})\n\n`;
                }

                statsMessage += `_Gesamt: ${allStats.length} Session(s)_`;
                await safeSend(statsMessage);
                break;

            case '!gesamtstats':
                const globalStats = getGlobalStats();
                
                const formatDate = (timestamp) => {
                    const date = new Date(timestamp);
                    return date.toLocaleString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                };
                
                const formatUptime = (ms) => {
                    const seconds = Math.floor(ms / 1000);
                    const minutes = Math.floor(seconds / 60);
                    const hours = Math.floor(minutes / 60);
                    const days = Math.floor(hours / 24);
                    
                    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
                    if (hours > 0) return `${hours}h ${minutes % 60}m`;
                    if (minutes > 0) return `${minutes}m`;
                    return `${seconds}s`;
                };
                
                const totalMessages = (globalStats.totalMessagesReceived || 0) + (globalStats.totalMessagesSent || 0);
                const received = (globalStats.totalMessagesReceived || 0).toLocaleString('de-DE');
                const sent = (globalStats.totalMessagesSent || 0).toLocaleString('de-DE');
                
                let globalMessage = '📊 *Gesamtstatistik*\n\n';
                globalMessage += `📨 Nachrichten: ${totalMessages.toLocaleString('de-DE')} (↓${received} / ↑${sent})\n`;
                globalMessage += `🔢 Sessions: ${globalStats.totalSessions}\n`;
                globalMessage += `🔄 Neustarts: ${globalStats.totalRestarts}\n`;
                globalMessage += `⏱️ Gesamtlaufzeit: ${formatUptime(globalStats.totalUptime)}\n`;
                globalMessage += `🗓️ Seit: ${formatDate(globalStats.firstStarted)}\n`;
                globalMessage += `🕐 Aktualisiert: ${formatDate(globalStats.lastUpdated)}`;
                
                await safeSend(globalMessage);
                break;

            case '!neustart':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !neustart <sessionId>');
                    break;
                }
                
                // Check lock to prevent duplicate restart
                const restartKey = `restart:${targetSession}`;
                if (!await acquireLock(restartKey)) {
                    await safeSend(`⏳ Session *${targetSession}* wird bereits neu gestartet...`);
                    break;
                }
                
                try {
                    // Send response first if restarting own session
                    if (targetSession === msg.sessionId) {
                        await safeSend(`🔄 Starte Session *${targetSession}* neu...`);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        await client.restartSession(targetSession);
                    } else {
                        await client.restartSession(targetSession);
                        await safeSend(`✅ Session *${targetSession}* wurde neu gestartet`);
                    }
                } finally {
                    releaseLock(restartKey);
                }
                break;

            case '!pause':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !pause <sessionId>');
                    break;
                }
                
                // Check lock to prevent duplicate pause
                const pauseKey = `pause:${targetSession}`;
                if (!await acquireLock(pauseKey)) {
                    await safeSend(`⏳ Session *${targetSession}* wird bereits pausiert...`);
                    break;
                }
                
                try {
                    // Send response first if pausing own session
                    if (targetSession === msg.sessionId) {
                        await safeSend(`⏸️ Pausiere Session *${targetSession}*...`);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        await client.pauseSession(targetSession);
                    } else {
                        await client.pauseSession(targetSession);
                        await safeSend(`⏸️ Session *${targetSession}* wurde pausiert`);
                    }
                } finally {
                    releaseLock(pauseKey);
                }
                break;

            case '!fortsetzen':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !fortsetzen <sessionId>');
                    break;
                }
                await client.resumeSession(targetSession);
                await safeSend(`▶️ Session *${targetSession}* wurde fortgesetzt`);
                break;

            case '!stopp':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !stopp <sessionId>');
                    break;
                }
                
                // Check lock to prevent duplicate stop
                const stopKey = `stop:${targetSession}`;
                if (!await acquireLock(stopKey)) {
                    await safeSend(`⏳ Session *${targetSession}* wird bereits gestoppt...`);
                    break;
                }
                
                try {
                    // Send response first, then stop
                    if (targetSession === msg.sessionId) {
                        // Stopping own session - send message first
                        await safeSend(`⏹️ Stoppe Session *${targetSession}*...`);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        await client.stopSession(targetSession);
                    } else {
                        // Stopping different session
                        await client.stopSession(targetSession);
                        await safeSend(`⏹️ Session *${targetSession}* wurde gestoppt`);
                    }
                } finally {
                    releaseLock(stopKey);
                }
                break;

            case '!löschen':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !löschen <sessionId>');
                    break;
                }
                
                // Check lock to prevent duplicate delete
                const deleteKey = `delete:${targetSession}`;
                if (!await acquireLock(deleteKey)) {
                    await safeSend(`⏳ Session *${targetSession}* wird bereits gelöscht...`);
                    break;
                }
                
                try {
                    // Send response first if deleting own session
                    if (targetSession === msg.sessionId) {
                        await safeSend(`🗑️ Lösche Session *${targetSession}*...`);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        await client.deleteSessionData(targetSession);
                    } else {
                        await client.deleteSessionData(targetSession);
                        await safeSend(`🗑️ Session *${targetSession}* wurde gelöscht`);
                    }
                } finally {
                    releaseLock(deleteKey);
                }
                break;

            case '!start':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !start <sessionId>');
                    break;
                }
                
                // Check lock to prevent duplicate start
                const startKey = `start:${targetSession}`;
                if (!await acquireLock(startKey)) {
                    await safeSend(`⏳ Session *${targetSession}* wird bereits gestartet...`);
                    break;
                }
                
                try {
                    await startSession(targetSession);
                    await safeSend(`✅ Session *${targetSession}* wurde gestartet`);
                } finally {
                    releaseLock(startKey);
                }
                break;

            case '!zuweisen':
                if (!targetSession) {
                    await safeSend('❌ Verwendung: !zuweisen <sessionId>');
                    break;
                }
                
                try {
                    assignChat(msg.from, targetSession);
                    await safeSend(`📞 Dieser Chat ist jetzt *${targetSession}* zugewiesen`);
                } catch (e) {
                    await safeSend(`❌ ${e.message}`);
                }
                break;

            case '!zuweisungen':
                const assignmentList = Array.from(chatAssignments.entries())
                    .map(([chat, session]) => `• ${chat.split('@')[0]}: *${session}*`)
                    .join('\n');
                
                await safeSend(assignmentList 
                    ? `📋 *Chat-Zuweisungen:*\n\n${assignmentList}` 
                    : '📋 Noch keine Chat-Zuweisungen');
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        // Only send error if session still exists
        try {
            const sessions = client.getAllSessions();
            if (sessions.includes(msg.sessionId)) {
                await sendText(msg.sessionId, msg.from, `❌ Error: ${error.message}`);
            }
        } catch (e) {
            // Ignore if can't send error message
            console.error('Could not send error message:', e.message);
        }
    }
});