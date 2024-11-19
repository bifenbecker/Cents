import React from "react";
import * as Sentry from "@sentry/browser";

/**
 * An HoC to capture and send every error to Sentry
 *
 * This is a class-based component because React does not currently support
 * functional error boundary components
 */
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(JSON.stringify(errorInfo, null, 2));
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
