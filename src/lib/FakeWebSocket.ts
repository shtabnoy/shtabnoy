type MessageHandler = (event: { data: string }) => void;

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'ARB'];

const BASE_PRICES: Record<string, number> = {
  BTC: 67000,
  ETH: 3500,
  SOL: 180,
  BNB: 580,
  ARB: 1.2,
};

export class FakeWebSocket {
  onopen: ((event: unknown) => void) | null = null;
  onmessage: MessageHandler | null = null;
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  readyState: number = 0; // CONNECTING

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private prices: Record<string, number> = { ...BASE_PRICES };

  constructor(_url: string) {
    // Simulate async connection - mirrors real WebSocket behaviour
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.onopen?.({});
      this.startFeed();
    }, 300);
  }

  private startFeed() {
    this.intervalId = setInterval(() => {
      // Pick a random symbol and nudge its price
      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const drift = (Math.random() - 0.49) * 0.002; // slight upward bias
      this.prices[symbol] = +(this.prices[symbol] * (1 + drift)).toFixed(4);

      this.onmessage?.({
        data: JSON.stringify({ symbol, price: this.prices[symbol] }),
      });
    }, 50); // 20 messages/sec - fast enough to stress the buffer
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onclose?.({});
  }
}
