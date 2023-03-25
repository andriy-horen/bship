import { useMemo } from 'react';
import Twemoji from '../twemoji/Twemoji';
import { getFlagEmoji } from './getFlagEmoji';
import './Username.css';

export interface UsernameProps {
  username: string;
  countryCode: string;
}

export function Username({ username, countryCode }: UsernameProps) {
  const flagEmoji = useMemo(() => getFlagEmoji(countryCode), []);

  return (
    <>
      <Twemoji emoji={flagEmoji}></Twemoji>
      <span>{username}</span>
    </>
  );
}
