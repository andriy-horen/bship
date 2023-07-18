import { Burger, Container, Group, Header } from '@mantine/core';
import { PropsWithChildren, useState } from 'react';
import { PlayersOnline } from '../players-online/PlayersOnline';

export type AppLayoutProps = PropsWithChildren<Record<never, never>>;

export const AppLayout: React.FunctionComponent<AppLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Container>
      <Header height={56} mb={16}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Group>
            <Burger opened={menuOpen} onClick={() => setMenuOpen(!menuOpen)} aria-label={'nav'} />
          </Group>

          <Group>
            <PlayersOnline online={149}></PlayersOnline>
          </Group>
        </div>
      </Header>
      <main>{children}</main>
    </Container>
  );
};
