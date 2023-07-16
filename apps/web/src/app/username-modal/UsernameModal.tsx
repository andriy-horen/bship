import { Alert, Button, Group, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconInfoCircle } from '@tabler/icons-react';
import Twemoji from '../twemoji/Twemoji';

export interface UsernameModalProps {
  onSubmit: (payload: { username: string; preferredFlag: string }) => void;
}

export const UsernameModal = ({ innerProps }: ContextModalProps<UsernameModalProps>) => {
  const userFlag = '🇺🇦';

  return (
    <>
      <TextInput
        label="User name"
        placeholder="Choose family-friendly user name"
        required
        rightSection={<Twemoji emoji={userFlag} />}
      />

      <Alert icon={<IconInfoCircle size="1rem" />} mt={8}>
        No worries, we don't keep any of your info. Your user name and flag are just there for other
        players to see.
      </Alert>

      <Group mt={16} position="right">
        <Button onClick={() => innerProps.onSubmit({ username: '', preferredFlag: '' })}>
          Join
        </Button>
      </Group>
    </>
  );
};
