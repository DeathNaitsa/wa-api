import { 
    startSession, 
    onMessage, 
    sendText, 
    sendAudio,
    sendDocument,
    sendLocation,
    sendContact,
    sendReaction,
    sendTyping,
    sendRecording,
    sendPoll,
    uploadStatus,
    sendBroadcast,
    queueMessage,
    getQueueStatus,
    clearQueue,
    pauseQueue,
    resumeQueue,
    setRateLimit,
    setAutoReconnect,
    getConnectionHealth,
    createGroup,
    getGroupMetadata,
    updateGroupSubject,
    addParticipants,
    removeParticipants,
    promoteParticipants,
    demoteParticipants,
    leaveGroup,
    getGroupInviteCode,
    getProfilePicture,
    getContact,
    getStatus,
    updateProfileStatus,
    client, 
    getAllSessionsInfo, 
    getGlobalStats, 
    countReceivedMessage 
} from '@deathnaitsa/wa-api';

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
console.log('');
console.log('  📝 Gruppen:');
console.log('  !gruppeninfo       - Infos zur aktuellen Gruppe');
console.log('  !gruppenlink       - Einladungslink der Gruppe');
console.log('  !gruppenname <n>   - Gruppennamen ändern');
console.log('  !gruppenbio <t>    - Gruppenbeschreibung ändern');
console.log('  !hinzufügen <nr>   - Teilnehmer hinzufügen');
console.log('  !entfernen <nr>    - Teilnehmer entfernen');
console.log('  !promoten <nr>     - Zum Admin machen');
console.log('  !demoten <nr>      - Admin entfernen');
console.log('');
console.log('  📧 Nachrichten:');
console.log('  !ort <lat> <lon>   - Standort senden');
console.log('  !reaktion <emoji>  - Auf letzte Nachricht reagieren');
console.log('  !tippen            - Tipp-Indikator anzeigen');
console.log('  !aufnehmen         - Aufnahme-Indikator anzeigen');
console.log('  !umfrage <frage>   - Umfrage erstellen');
console.log('  !broadcast <text>  - Broadcast senden');
console.log('');
console.log('  📱 Status & Queue:');
console.log('  !status <text>     - Status hochladen');
console.log('  !queue <text>      - Nachricht in Queue');
console.log('  !queuestatus       - Queue Status anzeigen');
console.log('  !clearqueue        - Queue leeren');
console.log('  !ratelimit <n>     - Rate Limit setzen (n/min)');
console.log('');
console.log('  👤 Profil & Kontakt:');
console.log('  !profilbild        - Profilbild des Absenders');
console.log('  !status            - Status des Absenders');
console.log('  !kontakt           - Kontaktinfo');
console.log('  !meinestatus <t>   - Eigenen Status ändern');
console.log('');
console.log('  🔄 Verbindung:');
console.log('  !autoreconnect     - Auto-Reconnect aktivieren');
console.log('  !health            - Verbindungs-Status');
console.log('');
console.log('  ⚙️ Session:');
console.log('  !neustart <id>     - Session neu starten');
console.log('  !pause <id>        - Session pausieren');
console.log('  !fortsetzen <id>   - Session fortsetzen');
console.log('  !stopp <id>        - Session stoppen');
console.log('  !löschen <id>      - Session-Daten löschen');
console.log('  !start <id>        - Neue Session starten');
console.log('  !zuweisen <id>     - Diesen Chat einer Session zuweisen');
console.log('  !zuweisungen       - Alle Chat-Zuweisungen anzeigen\n');
console.log('  !entfernen <nr>    - Teilnehmer entfernen');
console.log('  !promoten <nr>     - Zum Admin machen');
console.log('  !demoten <nr>      - Admin entfernen');
console.log('');
console.log('  📧 Nachrichten:');
console.log('  !ort <lat> <lon>   - Standort senden');
console.log('  !reaktion <emoji>  - Auf letzte Nachricht reagieren');
console.log('  !tippen            - Tipp-Indikator anzeigen');
console.log('  !aufnehmen         - Aufnahme-Indikator anzeigen');
console.log('');
console.log('  👤 Profil & Kontakt:');
console.log('  !profilbild        - Profilbild des Absenders');
console.log('  !status            - Status des Absenders');
console.log('  !kontakt           - Kontaktinfo');
console.log('  !meinestatus <t>   - Eigenen Status ändern');
console.log('');
console.log('  ⚙️ Session:');
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

            // ===========================================
            // GROUP MANAGEMENT COMMANDS
            // ===========================================

            case '!gruppeninfo':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                try {
                    const metadata = await getGroupMetadata(msg.sessionId, msg.from);
                    let groupInfo = `📝 *Gruppeninfo*\n\n`;
                    groupInfo += `Name: ${metadata.subject}\n`;
                    groupInfo += `Beschreibung: ${metadata.desc || 'Keine'}\n`;
                    groupInfo += `Erstellt: ${new Date(metadata.creation * 1000).toLocaleDateString('de-DE')}\n`;
                    groupInfo += `Teilnehmer: ${metadata.participants.length}\n`;
                    groupInfo += `Admins: ${metadata.participants.filter(p => p.admin).length}\n`;
                    
                    await safeSend(groupInfo);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!gruppenlink':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                try {
                    const code = await getGroupInviteCode(msg.sessionId, msg.from);
                    const link = `https://chat.whatsapp.com/${code}`;
                    await safeSend(`🔗 *Einladungslink:*\n\n${link}`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}\n(Bist du Admin?)`);
                }
                break;

            case '!gruppenname':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                const newName = args.join(' ');
                if (!newName) {
                    await safeSend('❌ Verwendung: !gruppenname <neuer Name>');
                    break;
                }
                
                try {
                    await updateGroupSubject(msg.sessionId, msg.from, newName);
                    await safeSend(`✅ Gruppenname geändert zu: *${newName}*`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!gruppenbio':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                const newDesc = args.join(' ');
                if (!newDesc) {
                    await safeSend('❌ Verwendung: !gruppenbio <neue Beschreibung>');
                    break;
                }
                
                try {
                    await client.updateGroupDescription(msg.sessionId, msg.from, newDesc);
                    await safeSend(`✅ Beschreibung geändert`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!hinzufügen':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                const addNumber = args[0];
                if (!addNumber) {
                    await safeSend('❌ Verwendung: !hinzufügen <Telefonnummer>');
                    break;
                }
                
                try {
                    const jid = addNumber.includes('@') ? addNumber : `${addNumber}@s.whatsapp.net`;
                    await addParticipants(msg.sessionId, msg.from, [jid]);
                    await safeSend(`✅ Teilnehmer hinzugefügt`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!entfernen':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                const removeNumber = args[0];
                if (!removeNumber) {
                    await safeSend('❌ Verwendung: !entfernen <Telefonnummer>');
                    break;
                }
                
                try {
                    const jid = removeNumber.includes('@') ? removeNumber : `${removeNumber}@s.whatsapp.net`;
                    await removeParticipants(msg.sessionId, msg.from, [jid]);
                    await safeSend(`✅ Teilnehmer entfernt`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!promoten':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                const promoteNumber = args[0];
                if (!promoteNumber) {
                    await safeSend('❌ Verwendung: !promoten <Telefonnummer>');
                    break;
                }
                
                try {
                    const jid = promoteNumber.includes('@') ? promoteNumber : `${promoteNumber}@s.whatsapp.net`;
                    await promoteParticipants(msg.sessionId, msg.from, [jid]);
                    await safeSend(`✅ Zum Admin ernannt`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!demoten':
                if (!msg.isGroup) {
                    await safeSend('❌ Dieser Befehl funktioniert nur in Gruppen');
                    break;
                }
                
                const demoteNumber = args[0];
                if (!demoteNumber) {
                    await safeSend('❌ Verwendung: !demoten <Telefonnummer>');
                    break;
                }
                
                try {
                    const jid = demoteNumber.includes('@') ? demoteNumber : `${demoteNumber}@s.whatsapp.net`;
                    await demoteParticipants(msg.sessionId, msg.from, [jid]);
                    await safeSend(`✅ Admin-Rechte entfernt`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            // ===========================================
            // ADVANCED MESSAGING COMMANDS
            // ===========================================

            case '!ort':
                const lat = parseFloat(args[0]);
                const lon = parseFloat(args[1]);
                
                if (isNaN(lat) || isNaN(lon)) {
                    await safeSend('❌ Verwendung: !ort <Breitengrad> <Längengrad>\nBeispiel: !ort 52.520008 13.404954');
                    break;
                }
                
                try {
                    await sendLocation(msg.sessionId, msg.from, lat, lon, 'Mein Standort');
                    await safeSend(`📍 Standort gesendet`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!reaktion':
                const emoji = args[0];
                if (!emoji) {
                    await safeSend('❌ Verwendung: !reaktion <emoji>\nBeispiel: !reaktion 👍');
                    break;
                }
                
                if (!msg.quoted) {
                    await safeSend('❌ Bitte antworte auf eine Nachricht');
                    break;
                }
                
                try {
                    // Get the message ID from the quoted message
                    const quotedMsgId = msg.raw.message?.extendedTextMessage?.contextInfo?.stanzaId;
                    if (quotedMsgId) {
                        await sendReaction(msg.sessionId, msg.from, quotedMsgId, emoji);
                    } else {
                        await safeSend('❌ Konnte Nachricht nicht finden');
                    }
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!tippen':
                try {
                    await sendTyping(msg.sessionId, msg.from, true);
                    await safeSend('⌨️ Tipp-Indikator angezeigt (5 Sekunden)');
                    setTimeout(async () => {
                        await sendTyping(msg.sessionId, msg.from, false);
                    }, 5000);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!aufnehmen':
                try {
                    await sendRecording(msg.sessionId, msg.from, true);
                    await safeSend('🎙️ Aufnahme-Indikator angezeigt (5 Sekunden)');
                    setTimeout(async () => {
                        await sendRecording(msg.sessionId, msg.from, false);
                    }, 5000);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            // ===========================================
            // CONTACT & PROFILE COMMANDS
            // ===========================================

            case '!profilbild':
                try {
                    // Get sender's JID (use participant if in group)
                    const senderJid = msg.isGroup ? msg.participant : msg.from;
                    const url = await getProfilePicture(msg.sessionId, senderJid);
                    
                    if (url) {
                        await safeSend(`🖼️ *Profilbild:*\n\n${url}`);
                    } else {
                        await safeSend('❌ Kein Profilbild vorhanden');
                    }
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!status':
                try {
                    const senderJid = msg.isGroup ? msg.participant : msg.from;
                    const status = await getStatus(msg.sessionId, senderJid);
                    
                    if (status?.status) {
                        await safeSend(`💬 *Status:*\n\n${status.status}`);
                    } else {
                        await safeSend('❌ Kein Status vorhanden');
                    }
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!kontakt':
                try {
                    const senderJid = msg.isGroup ? msg.participant : msg.from;
                    const contact = await getContact(msg.sessionId, senderJid);
                    
                    let contactInfo = `👤 *Kontaktinfo:*\n\n`;
                    contactInfo += `JID: ${contact.jid}\n`;
                    contactInfo += `Nummer: ${contact.jid.split('@')[0]}\n`;
                    contactInfo += `Exists: ${contact.exists ? 'Ja' : 'Nein'}\n`;
                    
                    await safeSend(contactInfo);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!meinestatus':
                const newStatus = args.join(' ');
                if (!newStatus) {
                    await safeSend('❌ Verwendung: !meinestatus <neuer Status>');
                    break;
                }
                
                try {
                    await updateProfileStatus(msg.sessionId, newStatus);
                    await safeSend(`✅ Status geändert zu: "${newStatus}"`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            // ===========================================
            // POLL, BROADCAST, QUEUE & STATUS COMMANDS
            // ===========================================

            case '!umfrage':
                const pollQuestion = args.join(' ');
                if (!pollQuestion || !pollQuestion.includes('|')) {
                    await safeSend('❌ Verwendung: !umfrage Frage|Option1|Option2|Option3\nBeispiel: !umfrage Pizza oder Pasta?|Pizza|Pasta');
                    break;
                }
                
                try {
                    const [question, ...options] = pollQuestion.split('|').map(s => s.trim());
                    await sendPoll(msg.sessionId, msg.from, question, options);
                    await safeSend('✅ Umfrage gesendet!');
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!broadcast':
                const broadcastText = args.join(' ');
                if (!broadcastText) {
                    await safeSend('❌ Verwendung: !broadcast <Text>');
                    break;
                }
                
                try {
                    // Example: broadcast to first 3 contacts (customize as needed)
                    const sessions = client.getAllSessions();
                    const recipients = ['491234567890@s.whatsapp.net']; // Add real numbers
                    
                    await safeSend('📢 Sende Broadcast...');
                    const results = await sendBroadcast(msg.sessionId, recipients, { text: broadcastText });
                    
                    const successful = results.filter(r => r.success).length;
                    await safeSend(`✅ Broadcast: ${successful}/${results.length} erfolgreich`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!status':
                const statusText = args.join(' ');
                if (!statusText) {
                    await safeSend('❌ Verwendung: !status <Text>');
                    break;
                }
                
                try {
                    await uploadStatus(msg.sessionId, { text: statusText });
                    await safeSend('✅ Status hochgeladen!');
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!queue':
                const queueText = args.join(' ');
                if (!queueText) {
                    await safeSend('❌ Verwendung: !queue <Text>');
                    break;
                }
                
                try {
                    queueMessage(msg.sessionId, msg.from, { text: queueText }, 0);
                    await safeSend('✅ Nachricht zur Queue hinzugefügt');
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!queuestatus':
                try {
                    const queueStatus = getQueueStatus(msg.sessionId);
                    let queueInfo = `📊 *Queue Status*\n\n`;
                    queueInfo += `Warteschlange: ${queueStatus.queueLength} Nachrichten\n`;
                    
                    if (queueStatus.rateLimit) {
                        queueInfo += `Rate Limit: ${queueStatus.rateLimit.count}/${queueStatus.rateLimit.limit}\n`;
                        queueInfo += `Reset in: ${Math.round(queueStatus.rateLimit.resetIn / 1000)}s\n`;
                    }
                    
                    await safeSend(queueInfo);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!clearqueue':
                try {
                    clearQueue(msg.sessionId);
                    await safeSend('✅ Queue geleert');
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!ratelimit':
                const limit = parseInt(args[0]);
                if (isNaN(limit) || limit < 1) {
                    await safeSend('❌ Verwendung: !ratelimit <Anzahl pro Minute>\nBeispiel: !ratelimit 30');
                    break;
                }
                
                try {
                    setRateLimit(msg.sessionId, limit);
                    await safeSend(`✅ Rate Limit gesetzt: ${limit} Nachrichten/Minute`);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            // ===========================================
            // CONNECTION HEALTH & AUTO-RECONNECT
            // ===========================================

            case '!autoreconnect':
                try {
                    setAutoReconnect(msg.sessionId, true, 5, 2);
                    await safeSend('✅ Auto-Reconnect aktiviert\n- Max Retries: 5\n- Backoff: 2x');
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            case '!health':
                try {
                    const health = getConnectionHealth(msg.sessionId);
                    let healthInfo = `🏥 *Connection Health*\n\n`;
                    healthInfo += `Status: ${health.connected ? '🟢 Verbunden' : '🔴 Getrennt'}\n`;
                    healthInfo += `Uptime: ${Math.round(health.uptime / 1000)}s\n`;
                    healthInfo += `Auto-Reconnect: ${health.autoReconnect ? 'Aktiv' : 'Inaktiv'}\n`;
                    
                    if (health.autoReconnect) {
                        healthInfo += `Retries: ${health.retryCount}/${health.maxRetries}\n`;
                    }
                    
                    await safeSend(healthInfo);
                } catch (e) {
                    await safeSend(`❌ Fehler: ${e.message}`);
                }
                break;

            // ===========================================
            // SESSION MANAGEMENT COMMANDS
            // ===========================================

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