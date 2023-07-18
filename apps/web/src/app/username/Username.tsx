import { useMemo } from 'react';
import Twemoji from '../twemoji/Twemoji';
import styles from './Username.module.css';
import { getFlagEmoji } from './getFlagEmoji';

export interface UsernameProps {
  username: string;
  countryCode: string;
  flagPostion?: 'start' | 'end';
}

export function Username({ username, countryCode, flagPostion = 'start' }: UsernameProps) {
  const flagEmoji = useMemo(() => getFlagEmoji(countryCode), []);

  return (
    <span className={flagPostion === 'end' ? styles.reverse : undefined}>
      <Twemoji emoji={flagEmoji}></Twemoji>
      <span className={styles.username}>{username}</span>
    </span>
  );
}
