# Nishi WhatsApp API

Eine minimalistische, stabile WhatsApp Multi-Device API basierend auf Baileys mit erweiterten Session-Management und Statistik-Features.

## ⚠️ Status

**🚧 Work in Progress** - Die API ist funktional und stabil, aber noch nicht feature-complete. Aktive Entwicklung läuft.

### ✅ Implementiert
- Multi-Session Support
- Session Control (Start, Stop, Restart, Pause, Resume)
- Event System (Messages, Connected, Disconnected)
- Statistik-System mit JSON-Persistenz
- Message Parsing mit Mentions & Quoted Messages
- Uptime & Performance Tracking

### 🚧 In Entwicklung
- Media Download/Upload
- Group Management
- Contact Handling
- Message Reactions
- Status/Story Features
- Typing Indicators

### 📋 Geplant
- Auto-Reconnect Optionen
- Message Queue System
- Rate Limiting
- Webhook Support

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

## 🚀 Quick Start

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

#### 🚧 Media (Teilweise implementiert)
```javascript
import { client } from '@deathnaitsa/wa-api';

// Download Media (✅ Implementiert)
const buffer = await client.downloadMedia(message);

// Send Media (❌ Noch nicht implementiert)
// await client.sendImage(sessionId, jid, buffer, caption);
// await client.sendVideo(sessionId, jid, buffer, caption);
// await client.sendAudio(sessionId, jid, buffer);
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

#### ❌ Noch nicht implementiert
```javascript
// Group Management
// await client.createGroup(sessionId, subject, participants);
// await client.leaveGroup(sessionId, groupJid);
// await client.updateGroupSubject(sessionId, groupJid, subject);

// Contact Management  
// await client.getContacts(sessionId);
// await client.blockUser(sessionId, jid);

// Status/Stories
// await client.sendStory(sessionId, content);
// await client.getStatus(sessionId, jid);

// Advanced Features
// await client.sendReaction(sessionId, messageKey, emoji);
// await client.sendPresenceUpdate(sessionId, type);
```

## 🎮 Bot-Beispiel

Siehe `socket.js` für ein vollständiges Bot-Beispiel mit:
- Chat-Assignment System (keine Doppel-Antworten bei mehreren Sessions)
- Command-Lock System (keine Race-Conditions)
- Deutsche Befehle (!ping, !stats, !gesamtstats, !neustart, etc.)
- Session-Control Commands
- Latenz-Messung

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

- **Baileys v6.7.9** - WhatsApp Multi-Device API
- **Node.js v22+** - ES Modules
- **Pino** - Logger (Silent Mode)
- **QRCode-Terminal** - QR-Code Anzeige

## ⚡ Performance

- Minimale Code-Komplexität (~560 Zeilen Core)
- Event-driven Architektur
- Map-basierte Session-Verwaltung
- Keine unnötigen Dependencies

## 🛠️ Bekannte Einschränkungen & Design-Entscheidungen

### Nicht implementiert (Stand: November 2024)
- ❌ Media Upload (Send Image/Video/Audio)
- ❌ Group Management (Create/Leave/Update Groups)
- ❌ Contact Management (Block/Unblock)
- ❌ Status/Story Features
- ❌ Message Reactions
- ❌ Typing Indicators
- ❌ Presence Updates (Online/Offline Status)
- ❌ Auto-Reconnect (bewusst einfach gehalten)
- ❌ Message Queue/Rate Limiting
- ❌ Webhook Support

### Design-Philosophie
- **Einfachheit über Features** - Lieber stabil als feature-reich
- **Kein Auto-Reconnect** - Manuelles Management für mehr Kontrolle
- **Minimale Dependencies** - Nur Baileys, Pino, QRCode-Terminal
- **Event-Driven** - Keine Polling, nur Events
- **Map-basiert** - Schnelle Session-Lookups

### Performance-Charakteristiken
- ✅ Sehr schnelle Session-Switches
- ✅ Geringer Memory-Footprint (~50MB pro Session)
- ✅ Keine Blocking Operations
- ⚠️ Kein Built-in Rate Limiting (muss selbst implementiert werden)

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
