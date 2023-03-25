import { memo } from 'react';
import twemoji from 'twemoji';
import './Twemoji.module.css';

export interface TwemojiProps {
  emoji: string;
}

const Twemoji = ({ emoji }: TwemojiProps) => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: twemoji.parse(emoji, {
          folder: 'svg',
          ext: '.svg',
          className: 'twemoji-image',
        }),
      }}
    />
  );
};

export default memo(Twemoji);
