type UserContextData = {
  [userId: number]: Record<string, any>;
};

const store: UserContextData = {};

export const UserContext = {
  set(userId: number, key: string, value: any) {
    if (!store[userId]) store[userId] = {};
    store[userId][key] = value;
  },

  get<T = any>(userId: number, key: string): T | void {
    return store[userId]?.[key];
  },

  getAll(userId: number): Record<string, any> | void {
    return store[userId];
  },

  delete(userId: number, key: string) {
    delete store[userId]?.[key];
  },

  clear(userId: number) {
    delete store[userId];
  },

  getMany<T = any>(userId: number, keys: string[]): Record<string, T | void> {
    const result: Record<string, T | void> = {};
    for (const key of keys) {
      result[key] = this.get(userId, key);
    }
    return result;
  },

  setMany(userId: number, data: Record<string, any>) {
    if (!store[userId]) store[userId] = {};
    Object.entries(data).forEach(([key, value]) => {
      store[userId][key] = value;
    });
  },
}