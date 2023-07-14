export interface BshipConfiguration {
  idGenerator: {
    alphabet: string;
    size: number;
  };
}

export const defaultConfiguration = (): BshipConfiguration => ({
  idGenerator: {
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    size: 20,
  },
});
