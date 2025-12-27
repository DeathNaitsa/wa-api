# Nishi WhatsApp API

Eine minimalistische, stabile WhatsApp Multi-Device API basierend auf Baileys mit erweiterten Session-Management und Statistik-Features.

## 📑 Inhaltsverzeichnis

- [Status](#-status)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
  - [ES Modules](#es-modules-empfohlen)
  - [CommonJS](#commonjs)
- [API Dokumentation](#-api-dokumentation)
  - [Session Management](#-session-management-implementiert)
  - [Nachrichten](#-nachrichten-implementiert)
  - [Media & Stickers](#-media--stickers-implementiert)
  - [Group Management](#-group-management-implementiert)
  - [Advanced Messaging](#-advanced-messaging-implementiert)
  - [Contact Management](#-contact-management-implementiert)
  - [Presence & Typing](#-presence--typing-implementiert)
  - [Poll Messages](#-poll-messages-implementiert)
  - [Status/Stories](#-statusstories-implementiert)
  - [Broadcast Lists](#-broadcast-lists-implementiert)
  - [Message Queue & Rate Limiting](#-message-queue--rate-limiting-implementiert)
  - [Webhook Support](#-webhook-support-implementiert)
  - [Auto-Reconnect](#-auto-reconnect-implementiert)
  - [Events](#-events-implementiert)
  - [Statistiken](#-statistiken-implementiert)
- [Bot-Beispiel](#-bot-beispiel)
- [Statistik-System](#-statistik-system)
- [Architektur](#-architektur)
- [Technologie](#-technologie)
- [Performance](#-performance)
- [Bekannte Einschränkungen](#-bekannte-einschränkungen--design-entscheidungen)
- [Sicherheit](#-sicherheit)
- [Lizenz](#-lizenz)

## ⚠️ Status

**🎉 Feature-Complete v2.0** - Die API ist stabil, vollständig und production-ready!

### ✅ Implementiert
- ✅ Multi-Session Support
- ✅ Session Control (Start, Stop, Restart, Pause, Resume)
- ✅ Event System (Messages, Connected, Disconnected)
- ✅ Statistik-System mit JSON-Persistenz
- ✅ Message Parsing mit Mentions & Quoted Messages
- ✅ Uptime & Performance Tracking
- ✅ **Media Support** (Bilder, Videos, GIF-Playback)
- ✅ **Sticker Support** (Bilder, GIFs, Videos → Sticker mit wa-sticker-formatter)
- ✅ Media Download
- ✅ **Group Management** (Erstellen, Bearbeiten, Teilnehmer verwalten)
- ✅ **Advanced Messaging** (Audio, Document, Location, Contact, Reactions)
- ✅ **Contact Management** (Kontakte abrufen, Profilbilder, Status)
- ✅ **Presence & Typing** (Tipp-Indikatoren, Aufnahme-Status)
- ✅ **Poll Messages** (Umfragen erstellen)
- ✅ **Status/Stories** (Status hochladen)
- ✅ **Broadcast Lists** (Massenversand)
- ✅ **Message Queue & Rate Limiting** (Queue-System mit Prioritäten)
- ✅ **Webhook Support** (Externe Integrationen)
- ✅ **Auto-Reconnect** (Exponential Backoff, Max Retries)

### 📋 Geplante Erweiterungen
- Message Editing (wenn Baileys unterstützt)
- Business API Features
- Multi-Device Sync Improvements

## ✨ Features

- 🔄 **Multi-Session Support** - Unbegrenzt viele WhatsApp-Accounts parallel
- 📊 **Erweiterte Statistiken** - Tracking von Nachrichten (empfangen/gesendet), Uptime, Restarts
- 💾 **Persistente Statistiken** - JSON-basierte Speicherung in `sessions/stats.json`
- 🎯 **Volle Session-Control** - Start, Stop, Restart, Pause, Resume einzelner Sessions
- 🔒 **Stabile Architektur** - ~560 Zeilen Core-Code, minimale Komplexität
- 📨 **Event-System** - Einfache Event-Handler für Messages, Connections, Groups, etc.
- 🛡️ **Production-Ready** - Error-Handling, Command-Locks, Chat-Assignment
- ⚡ **Performance-Optimiert** - Map-basierte Session-Verwaltung, keine unnötigen Dependencies

## 📦 Installation

```bash
npm install
```

**Unterstützt beide Formate:**
- ✅ **ES Modules** (import)
- ✅ **CommonJS** (require)

## 🚀 Quick Start

### ES Modules (empfohlen)
```javascript
import { startSession, onMessage, sendText } from '@deathnaitsa/wa-api';

await startSession('bot');

onMessage(async (msg) => {
    console.log(`📨 ${msg.from}: ${msg.message}`);
    
    if (msg.message === '!ping') {
        await sendText(msg.sessionId, msg.from, 'Pong! 🏓');
    }
});
```

### CommonJS
```javascript
const { startSession, onMessage, sendText } = require('@deathnaitsa/wa-api');

(async () => {
    await startSession('bot');

    onMessage(async (msg) => {
        console.log(`📨 ${msg.from}: ${msg.message}`);
        
        if (msg.message === '!ping') {
            await sendText(msg.sessionId, msg.from, 'Pong! 🏓');
        }
    });
})();
```

## 📖 API Dokumentation

### Verfügbare Funktionen

#### ✅ Session Management (Implementiert)
```javascript
import { 
    startSession,      // Session starten
    stopSession,       // Session stoppen
    restartSession,    // Session neu starten
    client             // Direct client access
} from '@deathnaitsa/wa-api';

await startSession('bot1');
await stopSession('bot1');
await restartSession('bot1');

// Erweiterte Session-Control über Client
await client.pauseSession('bot1');      // ✅ Implementiert
await client.resumeSession('bot1');     // ✅ Implementiert
await client.deleteSessionData('bot1'); // ✅ Implementiert
```

#### ✅ Nachrichten (Implementiert)
```javascript
import { sendText, onMessage } from '@deathnaitsa/wa-api';

// Text senden
await sendText('bot1', '4915123456789@s.whatsapp.net', 'Hallo!');

// Nachrichten empfangen
onMessage((msg) => {
    console.log(`📨 ${msg.name}: ${msg.message}`);
    // msg enthält: sessionId, from, name, message, type, timestamp, 
    //              isGroup, participant, mentions, quotedMessage, fromMe
});
```

**Message Object Struktur:**

Das `msg` Object in `onMessage()` enthält folgende Felder:

```javascript
{
    // Basis-Informationen
    sessionId: 'bot1',                           // Session ID
    id: '3EB0XXXXX',                            // Nachrichten-ID
    from: '4915123456789@s.whatsapp.net',       // Chat JID
    fromMe: false,                               // Vom Bot gesendet?
    name: 'Max Mustermann',                      // Absender-Name
    message: 'Hallo, wie geht es?',             // Nachrichtentext
    timestamp: 1703001234,                       // Unix Timestamp
    
    // Gruppen-Informationen
    isGroup: false,                              // Ist Gruppenchat?
    participant: '4915123456789@s.whatsapp.net', // Absender in Gruppe
    
    // Erweiterte Features
    type: 'conversation',                        // Nachrichtentyp
    mentions: ['4915987654321@s.whatsapp.net'],  // Erwähnte Kontakte (@mentions)
    quoted: { /* quotedMessage Object */ },      // Zitierte Nachricht
    
    // Raw Baileys Message (für erweiterte Nutzung)
    raw: { /* vollständiges Baileys message object */ }
}
```

**Nachrichtentypen (`msg.type`):**
- `conversation` - Einfache Textnachricht
- `extendedTextMessage` - Text mit Links/Mentions
- `imageMessage` - Bild
- `videoMessage` - Video
- `audioMessage` - Audio/Voice
- `documentMessage` - Dokument
- `stickerMessage` - Sticker
- `locationMessage` - Standort
- `contactMessage` - Kontakt
- `pollCreationMessage` - Umfrage

**Beispiele:**

```javascript
onMessage(async (msg) => {
    // Text-Nachricht
    if (msg.type === 'conversation' || msg.type === 'extendedTextMessage') {
        console.log(`Text: ${msg.message}`);
    }
    
    // Gruppennachricht
    if (msg.isGroup) {
        console.log(`Gruppe: ${msg.from}`);
        console.log(`Von: ${msg.participant}`);
    }
    
    // Erwähnungen (@mentions)
    if (msg.mentions && msg.mentions.length > 0) {
        console.log(`Erwähnt: ${msg.mentions.join(', ')}`);
    }
    
    // Antwort auf Nachricht (quoted)
    if (msg.quoted) {
        console.log(`Antwortet auf: ${msg.quoted}`);
    }
    
    // Media herunterladen
    if (msg.type === 'imageMessage' || msg.type === 'videoMessage') {
        const buffer = await downloadMedia(msg);
        console.log(`Media heruntergeladen: ${buffer.length} bytes`);
    }
    
    // Auf Nachricht antworten
    if (msg.message === '!ping') {
        await client.replyMessage(msg.sessionId, msg, 'Pong! 🏓');
    }
});
```

#### ✅ Media & Stickers (Implementiert)
```javascript
import { 
    sendImage, 
    sendVideo, 
    sendSticker,
    sendImageAsSticker,
    sendGifAsSticker,
    sendVideoAsSticker,
    downloadMedia 
} from '@deathnaitsa/wa-api';

// Bilder & Videos senden (✅ Implementiert)
await sendImage('bot1', '4915123456789@s.whatsapp.net', './photo.jpg', 'Caption');
await sendVideo('bot1', '4915123456789@s.whatsapp.net', './video.mp4', 'Caption');
await sendVideo('bot1', '4915123456789@s.whatsapp.net', './gif.mp4', '', true); // GIF-Playback

// Sticker senden (✅ Implementiert mit wa-sticker-formatter)
// Universell - funktioniert mit Bildern, GIFs und Videos
await sendSticker('bot1', '4915123456789@s.whatsapp.net', './image.png', {
    packname: 'Mein Sticker Pack',
    author: 'Bot Name',
    type: 'default',  // 'default', 'crop', 'full', 'circle'
    quality: 100,     // 1-100
    categories: ['😂', '🎉']
});

// Spezialisierte Sticker-Funktionen
await sendImageAsSticker('bot1', 'nummer@s.whatsapp.net', './photo.jpg', {
    packname: 'Foto Pack',
    author: 'Bot',
    type: 'circle'    // Runder Sticker
});

await sendGifAsSticker('bot1', 'nummer@s.whatsapp.net', './animation.gif', {
    packname: 'GIF Pack',
    author: 'Bot'
});

await sendVideoAsSticker('bot1', 'nummer@s.whatsapp.net', './video.mp4', {
    packname: 'Video Sticker',
    author: 'Bot',
    type: 'full'      // Vollbild ohne Crop
});

// Mit Buffer
const fs = require('fs');
const buffer = fs.readFileSync('./sticker.png');
await sendSticker('bot1', 'nummer@s.whatsapp.net', buffer, {
    packname: 'Buffer Pack',
    author: 'Bot'
});

// Mit URL
await sendSticker('bot1', 'nummer@s.whatsapp.net', 'https://example.com/image.png', {
    packname: 'Online Pack',
    author: 'Bot'
});

// Download Media (✅ Implementiert)
const buffer = await downloadMedia(message);
```

**Sticker-Optionen:**
- `packname` - Name des Sticker-Packs (Standard: 'Nishi API')
- `author` - Autor des Stickers (Standard: 'WhatsApp Bot')
- `type` - Sticker-Typ: `'default'`, `'crop'`, `'full'`, `'circle'`
- `quality` - Qualität: 1-100 (Standard: 100)
- `categories` - Array von Emoji-Kategorien z.B. `['😂', '🎉']`

**Unterstützte Formate:**
- Bilder: PNG, JPG, JPEG, WEBP
- Animiert: GIF, MP4 (max. 10 Sekunden empfohlen)
```

#### ✅ Events (Implementiert)
```javascript
import { onMessage, onConnected, onDisconnected } from '@deathnaitsa/wa-api';

onMessage((msg) => {
    // Neue Nachricht empfangen
});

onConnected(({ sessionId }) => {
    console.log(`${sessionId} ist online!`);
});

onDisconnected(({ sessionId, reason }) => {
    console.log(`${sessionId} getrennt: ${reason}`);
});

// Weitere Events über Client:
client.on('groups:update', ({ sessionId, updates }) => {});
client.on('presence', ({ sessionId, id, presences }) => {});
client.on('chats:set', ({ sessionId, chats }) => {});
client.on('contacts:update', ({ sessionId, updates }) => {});
```

#### ✅ Statistiken (Implementiert)
```javascript
import { 
    getSessionInfo,      // Info über einzelne Session
    getAllSessionsInfo,  // Info über alle Sessions
    getGlobalStats,      // Globale Statistiken
    countReceivedMessage // Manuell Nachricht zählen
} from '@deathnaitsa/wa-api';

// Session Info
const info = getSessionInfo('bot1');
console.log({
    sessionId: info.sessionId,
    status: info.status,
    isActive: info.isActive,
    uptimeFormatted: info.uptimeFormatted,
    restartCount: info.restartCount,
    messagesReceived: info.messagesReceived,
    messagesSent: info.messagesSent
});

// Alle Sessions
const all = getAllSessionsInfo();
console.log(`Aktive Sessions: ${all.length}`);

// Globale Stats
const stats = getGlobalStats();
console.log({
    totalMessagesReceived: stats.totalMessagesReceived,
    totalMessagesSent: stats.totalMessagesSent,
    totalSessions: stats.totalSessions,
    totalRestarts: stats.totalRestarts,
    totalUptime: stats.totalUptime, // Node Prozess-Laufzeit in ms
    activeSessions: stats.activeSessions
});

// Manuell zählen (für Chat-Assignment Systeme)
countReceivedMessage('bot1');
```

### ✅ Poll Messages (Implementiert)
```javascript
import { sendPoll } from '@deathnaitsa/wa-api';

// Umfrage mit Einzelauswahl
await sendPoll('bot1', 'nummer@s.whatsapp.net', 
    'Was ist deine Lieblingsfarbe?', 
    ['Rot', 'Blau', 'Grün', 'Gelb'],
    1  // Nur 1 Option wählbar
);

// Umfrage mit Mehrfachauswahl
await sendPoll('bot1', 'groupId@g.us', 
    'Welche Programmiersprachen nutzt du?', 
    ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
    3  // Bis zu 3 Optionen wählbar
);
```

### ✅ Status/Stories (Implementiert)
```javascript
import { uploadStatus, getStatuses } from '@deathnaitsa/wa-api';

// Text-Status hochladen
await uploadStatus('bot1', { text: 'Hallo Welt! 👋' });

// Bild-Status hochladen
await uploadStatus('bot1', {
    image: './status-image.jpg',
    caption: 'Schöner Tag! ☀️'
});

// Video-Status hochladen
await uploadStatus('bot1', {
    video: './status-video.mp4',
    caption: 'Check this out! 🎥'
});

// Status-Liste abrufen (wenn verfügbar)
const statuses = await getStatuses('bot1');
```

### ✅ Broadcast Lists (Implementiert)
```javascript
import { sendBroadcast } from '@deathnaitsa/wa-api';

// Broadcast an mehrere Empfänger
const recipients = [
    '4915123456789@s.whatsapp.net',
    '4915987654321@s.whatsapp.net',
    '4916612345678@s.whatsapp.net'
];

const results = await sendBroadcast('bot1', recipients, { 
    text: '🎉 Wichtige Ankündigung für alle!' 
});

// Ergebnisse prüfen
results.forEach(result => {
    console.log(`${result.recipient}: ${result.success ? '✅' : '❌'}`);
});

// Broadcast mit Medien
await sendBroadcast('bot1', recipients, {
    image: './announcement.jpg',
    caption: 'Neues Update verfügbar!'
});
```

### ✅ Message Queue & Rate Limiting (Implementiert)
```javascript
import { 
    queueMessage, 
    setRateLimit, 
    getQueueStatus,
    clearQueue,
    pauseQueue,
    resumeQueue 
} from '@deathnaitsa/wa-api';

// Rate Limit setzen (30 Nachrichten pro Minute)
setRateLimit('bot1', 30);

// Nachricht mit Priorität zur Queue hinzufügen
queueMessage('bot1', 'nummer@s.whatsapp.net', 
    { text: 'Normale Nachricht' }, 
    0  // Priorität: 0 = normal
);

queueMessage('bot1', 'nummer@s.whatsapp.net', 
    { text: 'Wichtige Nachricht!' }, 
    10  // Priorität: 10 = hoch (wird zuerst gesendet)
);

// Queue Status abrufen
const status = getQueueStatus('bot1');
console.log(`Queue: ${status.queueLength} Nachrichten`);
console.log(`Rate Limit: ${status.rateLimit.count}/${status.rateLimit.limit}`);

// Queue verwalten
clearQueue('bot1');      // Queue leeren
pauseQueue('bot1');      // Queue pausieren
resumeQueue('bot1');     // Queue fortsetzen
```

**Vorteile:**
- 🚫 Verhindert Spam-Erkennung
- 📊 Automatisches Rate Limiting
- 🎯 Prioritäts-basierte Zustellung
- ⏸️ Pausieren/Fortsetzen möglich

### ✅ Webhook Support (Implementiert)
```javascript
import { 
    registerWebhook, 
    unregisterWebhook, 
    getWebhooks 
} from '@deathnaitsa/wa-api';

// Webhook registrieren
const webhookId = registerWebhook(
    'https://your-server.com/webhook',
    ['message', 'connected', 'disconnected'],  // Events
    'your-secret-key'  // Optional: für Signature Verification
);

console.log(`Webhook registriert: ${webhookId}`);

// Webhook entfernen
unregisterWebhook(webhookId);

// Alle Webhooks anzeigen
const webhooks = getWebhooks();
console.log(webhooks);
```

**Webhook Payload:**
```json
{
  "event": "message",
  "data": {
    "sessionId": "bot1",
    "from": "4915123456789@s.whatsapp.net",
    "message": "Hallo!",
    "timestamp": 1703001234567
  },
  "timestamp": 1703001234567
}
```

**Signature Verification:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
    const hash = crypto.createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return hash === signature;
}

// Im Webhook-Handler:
const signature = req.headers['x-webhook-signature'];
const isValid = verifyWebhook(req.body, signature, 'your-secret-key');
```

### ✅ Auto-Reconnect (Implementiert)
```javascript
import { setAutoReconnect, getConnectionHealth } from '@deathnaitsa/wa-api';

// Auto-Reconnect aktivieren
setAutoReconnect(
    'bot1',
    true,   // enabled
    5,      // maxRetries
    2       // backoff multiplier
);

// Verhalten:
// - 1. Versuch: nach 5 Sekunden
// - 2. Versuch: nach 10 Sekunden (5 * 2^1)
// - 3. Versuch: nach 20 Sekunden (5 * 2^2)
// - 4. Versuch: nach 40 Sekunden (5 * 2^3)
// - 5. Versuch: nach 80 Sekunden (5 * 2^4)

// Connection Health prüfen
const health = getConnectionHealth('bot1');
console.log({
    connected: health.connected,
    status: health.status,
    uptime: health.uptime,
    autoReconnect: health.autoReconnect,
    retryCount: health.retryCount,
    maxRetries: health.maxRetries
});

// Events abhören
client.on('reconnect:failed', ({ sessionId }) => {
    console.log(`${sessionId} konnte nicht wiederverbunden werden`);
});
```

**Vorteile:**
- 📈 Exponential Backoff verhindert Server-Überlastung
- 🔢 Konfigurierbare Max Retries
- 🎯 Automatische Wiederverbindung bei Netzwerkfehlern
- 📊 Connection Health Monitoring

#### ❌ Noch nicht implementiert
```javascript
// Message Editing (wartet auf Baileys Support)
// await client.editMessage(sessionId, messageKey, newText);

// Business API Features
// await client.getBusinessCategories();
// await client.updateBusinessHours();
```

## 🚀 Neue Features in v2.0

### ✅ Group Management (Implementiert)
```javascript
import { 
    createGroup,
    getGroupMetadata,
    updateGroupSubject,
    updateGroupDescription,
    addParticipants,
    removeParticipants,
    promoteParticipants,
    demoteParticipants,
    leaveGroup,
    getGroupInviteCode,
    acceptGroupInvite,
    updateGroupSettings
} from '@deathnaitsa/wa-api';

// Gruppe erstellen
const group = await createGroup('bot1', 'Meine Gruppe', [
    '4915123456789@s.whatsapp.net',
    '4915987654321@s.whatsapp.net'
]);

// Gruppen-Metadaten abrufen
const metadata = await getGroupMetadata('bot1', 'groupId@g.us');
console.log(metadata.subject, metadata.participants.length);

// Gruppennamen ändern
await updateGroupSubject('bot1', 'groupId@g.us', 'Neuer Name');

// Beschreibung ändern
await updateGroupDescription('bot1', 'groupId@g.us', 'Neue Beschreibung');

// Teilnehmer hinzufügen
await addParticipants('bot1', 'groupId@g.us', ['4915123456789@s.whatsapp.net']);

// Teilnehmer entfernen
await removeParticipants('bot1', 'groupId@g.us', ['4915123456789@s.whatsapp.net']);

// Zum Admin machen
await promoteParticipants('bot1', 'groupId@g.us', ['4915123456789@s.whatsapp.net']);

// Admin-Rechte entfernen
await demoteParticipants('bot1', 'groupId@g.us', ['4915123456789@s.whatsapp.net']);

// Gruppe verlassen
await leaveGroup('bot1', 'groupId@g.us');

// Einladungslink erhalten
const code = await getGroupInviteCode('bot1', 'groupId@g.us');
console.log(`https://chat.whatsapp.com/${code}`);

// Gruppe über Link beitreten
await acceptGroupInvite('bot1', 'inviteCode');

// Gruppen-Einstellungen (nur Admins können schreiben)
await updateGroupSettings('bot1', 'groupId@g.us', 'announcement');
// Alle können schreiben
await updateGroupSettings('bot1', 'groupId@g.us', 'not_announcement');
```

### ✅ Advanced Messaging (Implementiert)
```javascript
import { 
    sendAudio,
    sendDocument,
    sendLocation,
    sendContact,
    sendReaction,
    deleteMessage
} from '@deathnaitsa/wa-api';

// Audio senden (Voice Message)
await sendAudio('bot1', 'nummer@s.whatsapp.net', './audio.mp3', true);

// Audio senden (normaler Audio-File)
await sendAudio('bot1', 'nummer@s.whatsapp.net', './song.mp3', false);

// Dokument senden
await sendDocument('bot1', 'nummer@s.whatsapp.net', 
    './file.pdf', 
    'Dokument.pdf', 
    'application/pdf',
    'Hier ist das Dokument'
);

// Standort senden
await sendLocation('bot1', 'nummer@s.whatsapp.net', 52.520008, 13.404954, 'Berlin');

// Kontakt senden
await sendContact('bot1', 'nummer@s.whatsapp.net', [
    {
        displayName: 'Max Mustermann',
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:Max Mustermann\nTEL:+4915123456789\nEND:VCARD'
    }
]);

// Reaktion senden
await sendReaction('bot1', 'chatId@s.whatsapp.net', 'messageId', '👍');

// Reaktion entfernen
await sendReaction('bot1', 'chatId@s.whatsapp.net', 'messageId', '');

// Nachricht löschen
await deleteMessage('bot1', messageKey);
```

### ✅ Contact Management (Implementiert)
```javascript
import { 
    getProfilePicture,
    getContact,
    checkNumbersOnWhatsApp,
    blockContact,
    unblockContact,
    getBusinessProfile,
    getStatus
} from '@deathnaitsa/wa-api';

// Profilbild URL abrufen
const url = await getProfilePicture('bot1', '4915123456789@s.whatsapp.net');

// Kontaktinfo
const contact = await getContact('bot1', '4915123456789@s.whatsapp.net');

// Nummern auf WhatsApp prüfen
const results = await checkNumbersOnWhatsApp('bot1', ['4915123456789', '4915987654321']);

// Kontakt blockieren
await blockContact('bot1', '4915123456789@s.whatsapp.net');

// Kontakt entblocken
await unblockContact('bot1', '4915123456789@s.whatsapp.net');

// Business-Profil abrufen
const business = await getBusinessProfile('bot1', 'businessNumber@s.whatsapp.net');

// Status/About abrufen
const status = await getStatus('bot1', '4915123456789@s.whatsapp.net');
console.log(status?.status);
```

### ✅ Presence & Typing (Implementiert)
```javascript
import { 
    sendTyping,
    sendRecording,
    updateProfileStatus,
    updateProfileName,
    setProfilePicture,
    markChatRead
} from '@deathnaitsa/wa-api';

// Tipp-Indikator anzeigen
await sendTyping('bot1', 'chatId@s.whatsapp.net', true);
// Stoppen
await sendTyping('bot1', 'chatId@s.whatsapp.net', false);

// Aufnahme-Indikator anzeigen
await sendRecording('bot1', 'chatId@s.whatsapp.net', true);
// Stoppen
await sendRecording('bot1', 'chatId@s.whatsapp.net', false);

// Eigenen Status ändern
await updateProfileStatus('bot1', 'Verfügbar 🟢');

// Eigenen Namen ändern
await updateProfileName('bot1', 'Neuer Name');

// Profilbild setzen
await setProfilePicture('bot1', './profile.jpg');

// Chat als gelesen markieren
await markChatRead('bot1', 'chatId@s.whatsapp.net', [messageKey1, messageKey2]);
```

## 🎮 Bot-Beispiel

Siehe `socket.js` für ein vollständiges Bot-Beispiel mit **50+ Befehlen**:

### Basis-Befehle
- **!ping** / **!ping all** - Bot & alle Sessions testen
- **!info** - Nachrichteninfo anzeigen
- **!liste** - Alle Sessions auflisten
- **!stats** - Detaillierte Session-Statistiken
- **!gesamtstats** - Gesamtstatistik aller Sessions

### Gruppen-Befehle
- **!gruppeninfo** - Infos zur aktuellen Gruppe
- **!gruppenlink** - Einladungslink der Gruppe
- **!gruppenname** - Gruppennamen ändern
- **!gruppenbio** - Gruppenbeschreibung ändern
- **!hinzufügen** / **!entfernen** - Teilnehmer verwalten
- **!promoten** / **!demoten** - Admin-Rechte verwalten

### Nachrichten-Befehle
- **!ort** - Standort senden
- **!reaktion** - Auf Nachricht reagieren
- **!tippen** / **!aufnehmen** - Indikatoren anzeigen
- **!umfrage** - Umfrage erstellen
- **!broadcast** - Broadcast senden

### Status & Queue
- **!status** - Status hochladen
- **!queue** - Nachricht zur Queue hinzufügen
- **!queuestatus** - Queue Status anzeigen
- **!clearqueue** - Queue leeren
- **!ratelimit** - Rate Limit setzen

### Profil & Kontakt
- **!profilbild** - Profilbild anzeigen
- **!status** - Status abrufen
- **!kontakt** - Kontaktinfo anzeigen
- **!meinestatus** - Eigenen Status ändern

### Verbindung
- **!autoreconnect** - Auto-Reconnect aktivieren
- **!health** - Verbindungs-Status prüfen

### Session-Verwaltung
- **!neustart** / **!pause** / **!fortsetzen** / **!stopp** - Session Control
- **!löschen** - Session-Daten löschen
- **!start** - Neue Session starten
- **!zuweisen** - Chat einer Session zuweisen
- **!zuweisungen** - Alle Zuweisungen anzeigen

**Features:**
- ✅ Chat-Assignment System (keine Doppel-Antworten)
- ✅ Command-Lock System (keine Race-Conditions)
- ✅ Latenz-Messung
- ✅ Error-Handling

## 📊 Statistik-System

### Was wird getrackt?

Die API sammelt automatisch folgende Metriken:

**Pro Session:**
- `messagesReceived` - Empfangene User-Nachrichten (ohne Bot-eigene)
- `messagesSent` - Gesendete Bot-Nachrichten
- `restarts` - Anzahl der Neustarts
- `totalUptime` - Gesamte Session-Laufzeit (akkumuliert)
- `currentUptime` - Aktuelle Laufzeit seit letztem Start
- `created` - Timestamp der Session-Erstellung

**Global:**
- `totalMessagesReceived` - Summe aller empfangenen Nachrichten
- `totalMessagesSent` - Summe aller gesendeten Nachrichten  
- `totalSessions` - Anzahl je erstellter Sessions
- `totalRestarts` - Summe aller Restarts
- `totalUptime` - **Node Prozess-Laufzeit** (nicht Summe der Sessions!)
- `firstStarted` - Timestamp des ersten Starts
- `lastUpdated` - Timestamp der letzten Aktualisierung
- `activeSessions` - Aktuell verbundene Sessions

### Wichtig: Message Counting

**Automatisches Counting ist DEAKTIVIERT!**

Um Duplikate zu vermeiden (wenn mehrere Sessions im gleichen Chat sind), muss das Zählen manuell erfolgen:

```javascript
import { countReceivedMessage } from '@deathnaitsa/wa-api';

onMessage((msg) => {
    // Nur zählen wenn diese Session für den Chat zuständig ist
    if (isAssignedToThisSession(msg.from)) {
        countReceivedMessage(msg.sessionId);
    }
});
```

Siehe `socket.js` für ein vollständiges Beispiel mit Chat-Assignment.

### Persistenz

Statistiken werden automatisch in `sessions/stats.json` gespeichert:
```json
{
  "totalMessagesReceived": 1523,
  "totalMessagesSent": 842,
  "totalSessions": 3,
  "totalRestarts": 12,
  "totalUptime": 3847291,
  "firstStarted": 1700000000000,
  "lastUpdated": 1700847291000,
  "sessions": {
    "bot": {
      "messagesReceived": 823,
      "messagesSent": 456,
      "restarts": 5,
      "created": 1700000000000
    }
  }
}
```

## 🏗️ Architektur

```
nishi-wa-api-new/
├── dist/
│   ├── WhatsAppClient.js    # Core API (~560 Zeilen)
│   └── index.js             # Export Wrapper
├── package.json
└── README.md

wa_credentials/             # Session-Daten
├── stats.json             # Globale Statistiken
├── bot/                   # Session "bot"
└── bot2/                  # Session "bot2"
```

## 🔧 Technologie

- **Baileys v7.0.0** - WhatsApp Multi-Device API
- **wa-sticker-formatter v4.4.4** - Sticker-Konvertierung
- **Node.js v22+** - ES Modules
- **Pino** - Logger (Silent Mode)
- **QRCode-Terminal** - QR-Code Anzeige

## ⚡ Performance

- Minimale Code-Komplexität (~560 Zeilen Core)
- Event-driven Architektur
- Map-basierte Session-Verwaltung
- Keine unnötigen Dependencies

## 🛠️ Bekannte Einschränkungen & Design-Entscheidungen

### Was ist NICHT implementiert
- ❌ Message Editing (wartet auf Baileys Support)
- ❌ Business API erweiterte Features
- ❌ Chat Archive/Mute/Pin über API (manuell möglich)

### Vollständig implementiert in v2.0 ✅
- ✅ Group Management (Complete - 12 Funktionen)
- ✅ Advanced Messaging (Complete - 6 Funktionen)
- ✅ Contact Management (Complete - 7 Funktionen)
- ✅ Presence & Typing (Complete - 7 Funktionen)
- ✅ Poll Messages (Complete)
- ✅ Status/Stories (Complete)
- ✅ Broadcast Lists (Complete)
- ✅ Message Queue & Rate Limiting (Complete - 6 Funktionen)
- ✅ Webhook Support (Complete - 3 Funktionen)
- ✅ Enhanced Auto-Reconnect (Complete mit Exponential Backoff)

**Total: 60+ Funktionen implementiert!**

### Design-Philosophie
- **Feature-Complete über Minimalismus** - Alle wichtigen Features implementiert
- **Production-Ready** - Robustes Error-Handling und Rate Limiting
- **Dual Package Support** - CommonJS + ES Modules
- **Event-Driven** - Keine Polling, nur Events
- **Map-basiert** - Schnelle Session-Lookups
- **Obfuskiert** - Source Code geschützt

### Performance-Charakteristiken
- ✅ Sehr schnelle Session-Switches
- ✅ Geringer Memory-Footprint (~50-100MB pro Session)
- ✅ Keine Blocking Operations
- ✅ Built-in Rate Limiting
- ✅ Queue System für Mass-Messaging
- ✅ Auto-Reconnect mit Exponential Backoff

## 🔒 Sicherheit

- ✅ Credentials werden lokal in `sessions/` gespeichert
- ✅ Kein Cloud-Upload von Session-Daten
- ✅ Baileys Multi-Device Encryption
- ⚠️ **Keine Credentials in Git committen!**
- ⚠️ `sessions/` sollte in `.gitignore` sein

## 📝 Lizenz

MIT

## 🤝 Beitragen

Issues und Pull Requests sind willkommen!

## ⚠️ Disclaimer

Dieses Projekt verwendet Baileys und ist nicht offiziell von WhatsApp unterstützt. Nutzung auf eigene Gefahr.
