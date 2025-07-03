const tempStateMap = new Map<number, number>();

export default {
  getState(userId: number): number | undefined {
    return tempStateMap.get(userId);
  },

  setState(userId: number, state: number): void {
    tempStateMap.set(userId, state);
  },

  deleteState(userId: number): void {
    tempStateMap.delete(userId);
  }
};
