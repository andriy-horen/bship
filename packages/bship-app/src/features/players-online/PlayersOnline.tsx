import { IconUsers } from '@tabler/icons-react';

export interface PlayersOnlineProps {
  online: number;
}

export function PlayersOnline({ online }: PlayersOnlineProps) {
  return (
    <>
      <IconUsers size={18} />
      <div
        style={{
          marginLeft: '-12px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {online}
        <div
          style={{
            width: '7px',
            height: '7px',
            backgroundColor: '#37b24d',
            borderRadius: '50%',
            marginLeft: '4px',
          }}
        ></div>
      </div>
    </>
  );
}
