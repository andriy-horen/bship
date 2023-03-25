import { memo } from 'react';
import twemoji from 'twemoji';

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
        }),
      }}
    />
  );
};

export default memo(Twemoji);
