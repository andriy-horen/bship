import { useMemo } from 'react';
import Twemoji from '../twemoji/Twemoji';
import { getFlagEmoji } from './getFlagEmoji';
import css from './Username.module.css';

export interface UsernameProps {
  username: string;
  countryCode: string;
  flagPostion?: 'start' | 'end';
}

export function Username({ username, countryCode, flagPostion = 'start' }: UsernameProps) {
  const flagEmoji = useMemo(() => getFlagEmoji(countryCode), []);

  return (
    <span className={flagPostion === 'end' ? css.reverse : undefined}>
      <Twemoji emoji={flagEmoji}></Twemoji>
      <span className={css.username}>{username}</span>
    </span>
  );
}
