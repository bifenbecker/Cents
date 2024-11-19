import React, {useEffect} from "react";
import {Provider} from "react-redux";
import store from "./store";
import "./global.scss";
import Routes from "./containers/routes.js";
import {withLDProvider} from "launchdarkly-react-client-sdk";
import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";
import {Toaster} from "react-hot-toast";

import {BASE_URL, LAUNCHDARKLY_KEY, INTERCOM_APP_ID} from "./utils/config";
import {app_urls} from "./constants";
import ErrorBoundary from "./ErrorBoundary";
import {IntercomProvider} from "react-use-intercom";

const App = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_KEY,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.5,
    environment: process.env.REACT_APP_ENV,
  });

  useEffect(() => {
    const faviconEl = document.getElementById("favicon");

    const env = Object.keys(app_urls).find((key) => BASE_URL.includes(app_urls[key]));

    faviconEl.href = `/favicons/favicon-${env}.ico`;
  }, []);

  return (
    <ErrorBoundary>
      <IntercomProvider appId={INTERCOM_APP_ID}>
        <Provider store={store}>
          <Routes />
          <Toaster position="bottom-center" reverseOrder={false} />
        </Provider>
      </IntercomProvider>
    </ErrorBoundary>
  );
};

export default withLDProvider({
  clientSideID: LAUNCHDARKLY_KEY,
  user: {anonymous: true},
})(App);
