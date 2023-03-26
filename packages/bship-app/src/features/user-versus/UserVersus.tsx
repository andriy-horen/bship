import { IconX } from '@tabler/icons-react';
import { Username } from '../username/Username';
import css from './UserVersus.module.css';

export interface UserWithFlag {
  username: string;
  countryCode: string;
}

export interface UserVersusProps {
  user1: UserWithFlag;
  user2: UserWithFlag;
}

export function UserVersus({ user1, user2 }: UserVersusProps) {
  return (
    <span className={css.userVersus}>
      <span className={css.isActive}>
        <Username username={user1.username} countryCode={user1.countryCode}></Username>
      </span>
      <IconX />
      <span className={css.isActive}>
        <Username
          username={user2.username}
          countryCode={user2.countryCode}
          flagPostion="end"
        ></Username>
      </span>
    </span>
  );
}
