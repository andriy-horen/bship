import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import App from './App';
import { UsernameModal } from './features/username-modal/UsernameModal';
import './index.css';
import reportWebVitals from './reportWebVitals';

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
          <App />
        </ModalsProvider>
      </MantineProvider>
    </SWRConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
