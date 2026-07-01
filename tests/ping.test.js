'use strict';

const ping = require('../js/ping.js');

describe('ping', () => {
  let OriginalImage;

  beforeEach(() => {
    OriginalImage = global.Image;
    jest.useFakeTimers();
  });

  afterEach(() => {
    global.Image = OriginalImage;
    jest.useRealTimers();
  });

  it('resolves to a numeric latency when the image loads', async () => {
    global.Image = class {
      set src(value) {
        this._src = value;
        if (this.onload) this.onload();
      }
    };
    const delta = await ping('https://example.com/favicon.ico');
    expect(typeof delta).toBe('number');
    expect(delta).toBeGreaterThanOrEqual(0);
  });

  it('still resolves when the image errors (the server responded)', async () => {
    global.Image = class {
      set src(value) {
        this._src = value;
        if (this.onerror) this.onerror();
      }
    };
    const delta = await ping('https://example.com/favicon.ico', 0.3);
    expect(typeof delta).toBe('number');
  });

  it('rejects with a Timeout error when nothing loads within 5s', async () => {
    global.Image = class {
      set src(value) {
        this._src = value; // never triggers onload/onerror
      }
    };
    const pending = ping('https://example.com/favicon.ico');
    const assertion = expect(pending).rejects.toThrow('Timeout');
    jest.advanceTimersByTime(5000);
    await assertion;
  });
});
