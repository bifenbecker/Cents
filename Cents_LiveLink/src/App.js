import {useEffect, useState} from "react";
import {ThemeProvider} from "styled-components";
import {ToastContainer, Slide} from "react-toastify";
import TagManager from "react-gtm-module";
import {withLDProvider} from "launchdarkly-react-client-sdk";
import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";
import isEmpty from "lodash/isEmpty";

import "react-toastify/dist/ReactToastify.min.css";
import "./App.scss";

import {ExitIcon} from "./assets/images";

import {GlobalStyle, Loader} from "./components/common";
import Routes from "./Routes";
import theme from "./theme";
import {GTM_ID, ENVIRONMENT} from "./utils/config";

import ErrorBoundary from "./ErrorBoundary";
import useCustomerState from "./hooks/useCustomerState";
import {getParsedLocalStorageData} from "./utils/common";
import {CUSTOMER_KEY, CUSTOMER_AUTH_TOKEN_KEY} from "./utils";

function App() {
  if (ENVIRONMENT === "production") {
    const tagManagerArguments = {
      gtmId: GTM_ID,
    };
    TagManager.initialize(tagManagerArguments);
  }
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_KEY,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.5,
    environment: process.env.REACT_APP_ENVIRONMENT,
  });

  useEffect(() => {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    const onResize = () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      // Handling auto-focus input for android.
      // TODO: Test and add iphones if required
      // IOS detection function:
      // function iOS() {
      //   return (
      //     [
      //       "iPad Simulator",
      //       "iPhone Simulator",
      //       "iPod Simulator",
      //       "iPad",
      //       "iPhone",
      //       "iPod",
      //     ].includes(navigator.platform) ||
      //     // iPad on iOS 13 detection
      //     (navigator.userAgent.includes("Mac") && "ontouchend" in document)
      //   );
      // }
      // Reference: http://stackoverflow.com/a/9039885/177710
      if (/android/i.test(userAgent)) {
        window.addEventListener("resize", () => {
          if (document.activeElement.tagName === "INPUT") {
            window.setTimeout(function() {
              document.activeElement.scrollIntoView();
            }, 0);
          }
        });
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const {setCustomerState} = useCustomerState();
  const [settingCustomerState, setSettingCustomerState] = useState(true);

  useEffect(() => {
    setSettingCustomerState(true);
    const customer = getParsedLocalStorageData(CUSTOMER_KEY);
    const customerAuthToken = getParsedLocalStorageData(CUSTOMER_AUTH_TOKEN_KEY);
    setCustomerState({
      customer,
      customerAuthToken: isEmpty(customerAuthToken) ? null : customerAuthToken,
    });
    setSettingCustomerState(false);
  }, [setCustomerState]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {settingCustomerState ? <Loader /> : <Routes />}
        <ToastContainer
          newestOnTop
          hideProgressBar
          autoClose={4000}
          transition={Slide}
          position="top-center"
          closeButton={
            <img
              src={ExitIcon}
              alt="close"
              className="Toastify__close-button-customized"
            />
          }
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default withLDProvider({clientSideID: process.env.REACT_APP_LAUNCHDARKLY_KEY})(
  App
);
