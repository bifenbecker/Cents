import {useCallback} from "react";
import {useIntercom} from "react-use-intercom";
import {useFlags} from "launchdarkly-react-client-sdk";
import {parseTemplate} from "../utils/functions.js";

export const composeMetaData = (template, data, extraTemplateParams) => ({
  Description: parseTemplate(template, {...data, ...extraTemplateParams}),
  ...data,
});

export default () => {
  const {trackEvent, boot} = useIntercom();
  const {intercomDevelopment} = useFlags();

  const higherOrderTrackEvent = useCallback(
    (event, template, metaData = {}, extraTemplateParams = {}) => {
      intercomDevelopment &&
        trackEvent(event, composeMetaData(template, metaData, extraTemplateParams));
    },
    [intercomDevelopment, trackEvent]
  );

  const higherOrderBoot = useCallback(
    (...args) => {
      intercomDevelopment && boot(...args);
    },
    [intercomDevelopment, boot]
  );

  return {
    trackEvent: higherOrderTrackEvent,
    boot: higherOrderBoot,
  };
};
