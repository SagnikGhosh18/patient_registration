export class BroadcastChannelService {
    private channel: BroadcastChannel;
    private listeners: Map<string, ((data: any) => void)[]>;

    constructor() {
        this.channel = new BroadcastChannel('patient_registration_channel');
        this.listeners = new Map();

        this.channel.onmessage = (event) => {
            const { type, payload } = event.data;
            const callbacks = this.listeners.get(type) || [];
            callbacks.forEach(callback => callback(payload));
        };
    }

    public broadcast(type: string, payload: any): void {
        this.channel.postMessage({ type, payload });
    }

    public subscribe(type: string, callback: (data: any) => void): () => void {
        const callbacks = this.listeners.get(type) || [];
        callbacks.push(callback);
        this.listeners.set(type, callbacks);

        return () => this.unsubscribe(type, callback);
    }

    private unsubscribe(type: string, callback: (data: any) => void): void {
        const callbacks = this.listeners.get(type) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
            this.listeners.set(type, callbacks);
        }
    }

    public destroy(): void {
        this.listeners.clear();
        this.channel.close();
    }
}

export const broadcastChannel = new BroadcastChannelService();
