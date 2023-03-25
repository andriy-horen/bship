import { IconX } from '@tabler/icons-react';
import { Username } from '../username/Username';

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
    <>
      <Username username={user1.username} countryCode={user1.countryCode}></Username>
      <IconX />
      <Username username={user2.username} countryCode={user2.countryCode}></Username>
    </>
  );
}
