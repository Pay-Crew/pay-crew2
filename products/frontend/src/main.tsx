import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: `${import.meta.env.VITE_SENTRY_DSN}`,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    // Use the default strategy, an alias for `feedbackSyncIntegration`
    // https://docs.sentry.io/platforms/javascript/guides/react/user-feedback/configuration/#crash-report-modal
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'light',
      showName: false,
      showEmail: false,
      enableScreenshot: true,
      isNameRequired: false,
      isEmailRequired: false,
      triggerLabel: 'User Feedback',
      triggerAriaLabel: 'Send Feedback',
      formTitle: 'User Feedback',
      nameLabel: '',
      namePlaceholder: '',
      emailLabel: '',
      emailPlaceholder: '',
      messageLabel: 'Feedback Message',
      isRequiredLabel: '(Required)',
      messagePlaceholder: 'Please enter your feedback',
      addScreenshotButtonLabel: 'Add Screenshot',
      removeScreenshotButtonLabel: 'Remove Screenshot',
      submitButtonLabel: 'Submit',
      cancelButtonLabel: 'Cancel',
      successMessageText: 'Thank you for your feedback!',
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/pay-crew\.yukiosada\.work\//],
  // Session Replay
  replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  // Enable logs to be sent to Sentry
  enableLogs: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
