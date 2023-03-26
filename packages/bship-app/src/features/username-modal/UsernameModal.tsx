import { Alert, Button, Group, TextInput } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import Twemoji from '../twemoji/Twemoji';

export const UsernameModal = () => {
  return (
    <>
      <TextInput
        label="User name"
        placeholder="Choose family-friendly user name"
        required
        rightSection={<Twemoji emoji="🇺🇦" />}
      />

      <Alert icon={<IconAlertCircle size="1rem" />} mt={8}>
        No worries, we don't keep any of your info. Your user name and flag are just there for other
        players to see.
      </Alert>

      <Group mt={16} position="right">
        <Button>Join</Button>
      </Group>
    </>
  );
};
