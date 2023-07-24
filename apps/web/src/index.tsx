import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { App } from './app/App';
import { UsernameModal } from './app/username-modal/UsernameModal';
import './styles.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

const fetcher = (input: RequestInfo | URL, init?: RequestInit | undefined) =>
  fetch(input, init).then((res) => res.json());

root.render(
  <React.StrictMode>
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <ModalsProvider modals={{ usernameModal: UsernameModal }}>
          <Notifications />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </SWRConfig>
  </React.StrictMode>,
);
