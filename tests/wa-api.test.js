import * as wa from '../lib/index.js';  // Pfad zu deinem gebauten Modul

describe('@deathnaitsa/wa-api – Public API', () => {
  test('exportiert startSession, sendMessage, relayMessage, onConnected, onMessageReceived', () => {
    expect(typeof wa.startSession).toBe('function');
    expect(typeof wa.sendMessage).toBe('function');
    expect(typeof wa.relayMessage).toBe('function');
    expect(typeof wa.onConnected).toBe('function');
    expect(typeof wa.onMessageReceived).toBe('function');
  });
});
