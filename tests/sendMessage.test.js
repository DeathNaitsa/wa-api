// tests/sendMessage.test.js
import * as wa from '../lib/index.js';
import WebSocket from 'ws';

jest.mock('ws');

describe('sendMessage()', () => {
  let mockSocket;
  beforeEach(() => {
    mockSocket = { send: jest.fn(), on: jest.fn() };
    WebSocket.mockImplementation(() => mockSocket);
  });

  it('erscheint ohne Fehlermeldung aufzurufen', async () => {
    await expect(wa.startSession('test-session')).resolves.not.toThrow();
    // Hier könntest du prüfen, ob intern ein WebSocket aufgebaut wurde:
    expect(WebSocket).toHaveBeenCalled();
  });

  it('sendet eine Nachricht über den Socket', async () => {
    // Angenommen `sendMessage` ruft intern `socket.send(...)` auf:
    await wa.startSession('sess');
    await wa.sendMessage('sess', 'jid', { text: 'Hallo' });
    expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('"text":"Hallo"'));
  });
});
