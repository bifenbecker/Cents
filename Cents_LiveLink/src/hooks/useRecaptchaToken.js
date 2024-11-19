import {useState, useEffect} from "react";
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";

const useRecaptchaToken = componentName => {
  const [token, setToken] = useState(null);
  const {executeRecaptcha} = useGoogleReCaptcha();

  /**
   * Trigger reCAPTCHA validation of authentic user activity
   */
  useEffect(() => {
    (async () => {
      const recaptchaToken = executeRecaptcha && (await executeRecaptcha(componentName));
      setToken(recaptchaToken);
    })();
  }, [componentName, executeRecaptcha]);

  return token;
};

export default useRecaptchaToken;
