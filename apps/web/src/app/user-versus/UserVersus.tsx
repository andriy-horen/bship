import { IconX } from '@tabler/icons-react';
import { Username } from '../username/Username';
import styles from './UserVersus.module.css';

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
    <span className={styles.userVersus}>
      <span className={`${styles.user} ${styles.isActive}`}>
        <Username username={user1.username} countryCode={user1.countryCode}></Username>
      </span>
      <IconX className={styles.middleIcon} />
      <span className={styles.user}>
        <Username
          username={user2.username}
          countryCode={user2.countryCode}
          flagPostion="end"
        ></Username>
      </span>
    </span>
  );
}
