# wa-api

Leichte Bibliothek zur Verwaltung mehrerer WhatsApp-Sessions – mit **einer** universellen `sendMessage`-Funktion und direkter `relayMessage`-Unterstützung für alle fortgeschrittenen Szenarien.

---

## 📑 Inhaltsverzeichnis

1. [Installation](#-installation)
2. [Import & Setup](#-import--setup)
3. [Session Management](#-session-management)
4. [Nachrichten senden via `sendMessage`](#-nachrichten-senden-via-sendmessage)
5. [Low-level `relayMessage` Beispiele](#low-level-relaymessage-beispiele)

   * [ProtocolMessage: Nachricht löschen (Revoke)](#protocolmessage-nachricht-löschen-revoke)
   * [Ephemeral-Modus (Gruppen)](#ephemeral-modus-gruppen)
   * [Status-Update (Story)](#status-update-story)
   * [Weiterleiten (Forward)](#weiterleiten-forward)
   * [Profilbild aktualisieren](#profilbild-aktualisieren)
   * [Chat als gelesen markieren](#chat-als-gelesen-markieren)
   * [Nachrichten id Bearbeiten](#Nachrichten-Id-selbst-Festlegen)  
6. [Listener](#-listener)
7. [Fehlerbehandlung](#-fehlerbehandlung)

---

## 📦 Installation

```bash
npm install @deathnaitsa/wa-api@latest
```

## 🔌 Import & Setup

```js
// CommonJS
const wa = require('@deathnaitsa/wa-api');

// ES Module
import * as wa from '@deathnaitsa/wa-api';
```

## 🚀 Session Management

```js
await wa.startSession('session1');
await wa.startSessionWithPairingCode('session2', { phoneNumber: '491234567890' });
const all = wa.getAllSession();
const one = wa.getSession('session1');
const loaded = await wa.loadSessionsFromStorage();
```

## 💬 Nachrichten senden via `sendMessage`

Eine **zentrale** Funktion für **alle** Nachrichtentypen:

```js
await wa.sendMessage(
  sessionId,      // Session-ID
  jidOrPhone,     // JID oder Telefonnummer
  content,        // AnyMessageContent
  options         // MiscMessageGenerationOptions
);
```

### Beispiele

| Typ            | Kurzbeschreibung           | content                                                                                      | options                       |
| -------------- | -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| Text           | Normale Textnachricht      | `{ text: 'Hallo Welt!' }`                                                                    | `{ quoted, mentions }`        |
| Bild           | Sende Bild                 | `{ image:{url:'./img.png'},caption:'Bild',viewOnce:true }`                                   | `{ quoted }`                  |
| Video          | Sende Video                | `{ video:{url:'./vid.mp4'},caption:'Video' }`                                                | `{ }`                         |
| GIF            | Sende GIF (MP4 + Playback) | `{ video:{url:'./gif.mp4'},gifPlayback:true }`                                               | `{ }`                         |
| Audio          | Voice Note (OGG/Opus)      | `{ audio: fs.createReadStream('test.ogg'),mimetype:'audio/ogg',ptt:true }`                   | `{ quoted }`                  |
| Dokument       | Datei                      | `{ document:{url:'./doc.pdf',filename:'Doc.pdf'} }`                                          | `{ }`                         |
| Poll           | Umfrage                    | `{ pollCreationMessage:{name:'Umfrage',options:[{name:'A'},{name:'B'}],selectableCount:1} }` | `{ quoted }`                  |
| React          | Emoji-Reaktion             | `{ react:{text:'👍',key:msg.key} }`                                                          | `{ quoted }`                  |
| Delete         | Löschen (Revoke)           | `{ delete: msg.key }`                                                                        | `{ }`                         |
| Pin            | Pin/Unpin                  | `{ pin:{type:1,time:3600,key:msg.key} }`                                                     | `{ }`                         |
| Contacts       | Kontaktkarte               | `{ contacts:{displayName:'Max',contacts:[{vcard}] } }`                                       | `{ }`                         |
| Location       | Standort                   | `{ location:{degreesLatitude:52.52,degreesLongitude:13.405} }`                               | `{ }`                         |
| Forward        | Weiterleiten               | `{ forward: origMsg }`                                                                       | `{ quoted }`                  |
| Status (Story) | Status-Update              | `{ video:{url:'story.mp4'},caption:'Status' }`                                               | `{ statusJidList:[...JIDs] }` |

---

## 🔄 Low-level `relayMessage` Beispiele

Direktes Senden von WAMessage-Stanzas für Spezialfälle.

### ProtocolMessage: Nachricht löschen (Revoke)

```js
const deleteNode = {
  protocolMessage: {
    key: { remoteJid: chatJid, fromMe: true, id: targetId },
    type: 7 // MESSAGE_REVOKE
  }
};
await wa.relayMessage(
  sessionId,
  chatJid,
  deleteNode,
  { messageId: targetId }
);
```

### Ephemeral-Modus (Gruppen)

```js
// 24h Ephemeral ein
await wa.relayMessage(
  sessionId,
  groupJid,
  { disappearingMessagesInChat: Defaults.WA_DEFAULT_EPHEMERAL },
  {}
);
// Ephemeral aus
await wa.relayMessage(
  sessionId,
  groupJid,
  { disappearingMessagesInChat: 0 },
  {}
);
```

### Status-Update (Story)

```js
const storyNode = {
  videoMessage: { url: './story.mp4' },
  caption: 'Meine Story' 
};
await wa.relayMessage(
  sessionId,
  'status@broadcast',
  storyNode,
  { statusJidList: ['491234567890@s.whatsapp.net'] }
);
```

### Weiterleiten (Forward)

```js
const origMsg = getMessageFromStore();
const forwardNode = { forward: origMsg };
await wa.relayMessage(
  sessionId,
  chatJid,
  forwardNode,
  { messageId: origMsg.key.id }
);
```

### Profilbild aktualisieren

```js
const updateNode = {
  profilePictureChange: {
    displayPicture: fs.readFileSync('./newprofile.jpg')
  }
};
await wa.relayMessage(
  sessionId,
  userJid,
  updateNode,
  { messageId: 'nishiProfileUpdate' }
);
```

### Chat als gelesen markieren

```js
const readNode = {
  protocolMessage: {
    key: { remoteJid: chatJid },
    type: 3 // READ 
  }
};
await wa.relayMessage(
  sessionId,
  chatJid,
  readNode,
  { messageId: 'nishiMarkRead' }
);
```
### Nachrichten Id selbst Festlegen

```js
 await wa.relayMessage(
    msg.sessionId,               // deine Session-ID
    msg.key.remoteJid,          
    {
    conversation: 'Dies ist eine Relay-Textnachricht'
  },                
    { messageId: `nishi`+ Date.now(); }       
  ); 
```


---

## 🎧 Listener

```js
wa.onConnected(id => console.log('Online:', id));
wa.onQRUpdated(info => console.log('QR:', info));
wa.onMessageReceived(msg => console.log('Nachricht:', msg));
```

## ⚠️ Fehlerbehandlung

```js
try {
  await wa.sendMessage(...);
} catch(e) {
  console.error(e);
}
```

---

© 2025 `@deathnaitsa/wa-api` • Support: [sebloidl13@gmail.com](mailto:sebloidl13@gmail.com)
