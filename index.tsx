
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import { VoiceWidgetProvider } from './i18n/VoiceWidgetContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <VoiceWidgetProvider>
        <App />
      </VoiceWidgetProvider>
    </I18nProvider>
  </React.StrictMode>
);
