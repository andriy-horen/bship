import { Alert, Button, Group, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import Twemoji from '../twemoji/Twemoji';

export function UsernameModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Player details">
        <TextInput
          label="User name"
          placeholder="Choose family-friendly user name"
          required
          rightSection={<Twemoji emoji="🇺🇦" />}
        />

        <Alert icon={<IconAlertCircle size="1rem" />} mt={8}>
          No worries, we don't keep any of your info. Your user name and flag are just there for
          other players to see.
        </Alert>

        <Group mt={16} position="right">
          <Button>Join</Button>
        </Group>
      </Modal>

      <Group position="center">
        <Button onClick={open}>Open modal</Button>
      </Group>
    </>
  );
}
