let instance = null;

class RealtimeManager {
  constructor() {
    if (instance) return instance;
    this.channels = new Map();
    this.callbacks = new Map();
    instance = this;
  }

  subscribe(supabase, table, filter, callback) {
    const key = `${table}-${JSON.stringify(filter || {})}`;

    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set());
    }
    this.callbacks.get(key).add(callback);

    if (!this.channels.has(key)) {
      const channelConfig = { event: '*', schema: 'public', table };
      if (filter) Object.assign(channelConfig, filter);

      const channel = supabase
        .channel(key)
        .on('postgres_changes', channelConfig, (payload) => {
          const cbs = this.callbacks.get(key);
          if (cbs) cbs.forEach((cb) => cb(payload));
        })
        .subscribe();

      this.channels.set(key, channel);
    }

    return () => {
      const cbs = this.callbacks.get(key);
      if (cbs) {
        cbs.delete(callback);
        if (cbs.size === 0) {
          const channel = this.channels.get(key);
          if (channel) supabase.removeChannel(channel);
          this.channels.delete(key);
          this.callbacks.delete(key);
        }
      }
    };
  }

  cleanup() {
    this.channels.forEach((channel, key) => {
      if (channel) {
        const { createClient } = require('@/lib/supabase/client');
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    });
    this.channels.clear();
    this.callbacks.clear();
  }
}

export const realtimeManager = new RealtimeManager();
