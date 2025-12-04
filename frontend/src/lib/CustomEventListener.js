class CustomEventListener {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    const listeners = this.events.get(event);
    listeners.add(listener);

    return () => this.unsubscribe(event, listener);
  }

  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (!listeners) return;
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Error in listener for "${event}":`, err);
      }
    }
  }

  unsubscribe(event, listener) {
    const listeners = this.events.get(event);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) this.events.delete(event);
  }
}

export default CustomEventListener;
