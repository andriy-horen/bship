export interface BshipConfiguration {
  idGeneration: {
    alphabet: string;
    size: number;
  };
}

export const defaultConfiguration = (): BshipConfiguration => ({
  idGeneration: {
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    size: 20,
  },
});
