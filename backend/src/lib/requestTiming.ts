import { AsyncLocalStorage } from "async_hooks";

export interface RequestTimingStore {
  authMs: number;
  authSource?: string;
  dbMs: number;
  dbQueries: number;
}

const timingStorage = new AsyncLocalStorage<RequestTimingStore>();

export const runWithRequestTiming = <T>(fn: () => T): T => {
  return timingStorage.run({ authMs: 0, dbMs: 0, dbQueries: 0 }, fn);
};

export const getRequestTiming = (): RequestTimingStore | undefined => {
  return timingStorage.getStore();
};

export const recordAuthTiming = (durationMs: number, source: string): void => {
  const store = timingStorage.getStore();
  if (!store) return;
  store.authMs += durationMs;
  store.authSource = source;
};

export const recordDbTiming = (durationMs: number): void => {
  const store = timingStorage.getStore();
  if (!store) return;
  store.dbMs += durationMs;
  store.dbQueries += 1;
};
