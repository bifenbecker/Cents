import {useCallback, useEffect, useState} from "react";
import {ThemeProvider} from "styled-components";
import {toast} from "react-toastify";
import isFunction from "lodash/isFunction";
import PropTypes from "prop-types";
import {useHistory} from "react-router-dom";

import {getBusinessThemeByUniqueCode} from "features/order/self-serve/redux/selfServeThunks";
import {useAppDispatch} from "app/hooks";
import {getThemeByBusinessIdId, getThemeByStoreId} from "./services/themeSettings";

import {applyTheme} from "../../utils/theme";
import theme from "../../theme";

import {GlobalStyle, Loader} from ".";

import ToastError from "../common/ToastError";

const WithTheme = props => {
  const dispatch = useAppDispatch();

  const {businessId, storeId, uniqueCodeMachine, children, redirectTo, onSuccess} = props;
  const history = useHistory();
  const [themeSettings, setThemeSettings] = useState();
  const [loading, setLoading] = useState(true);

  const fetchThemeSettings = useCallback(
    (storeId, businessId, uniqueCodeMachine) => {
      if (storeId) {
        return getThemeByStoreId(storeId);
      }

      if (businessId) {
        return getThemeByBusinessIdId(businessId);
      }

      if (uniqueCodeMachine) {
        return dispatch(getBusinessThemeByUniqueCode(uniqueCodeMachine)).unwrap();
      }
    },
    [dispatch]
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchThemeSettings(storeId, businessId, uniqueCodeMachine);
        setThemeSettings(response);
        if (onSuccess) onSuccess();
      } catch (error) {
        const errMsg = error.response?.data.error || error.message;
        console.warn(errMsg);
        switch (error?.response?.status) {
          case 404:
            if (redirectTo) {
              history.push(redirectTo);
            }
            toast.error(
              <ToastError message={`${storeId ? "Store" : "Business"} does not exist`} />
            );
            break;
          case 401:
            break;
          default:
            toast.error(
              <ToastError
                message={`${storeId ? "Store" : "Business"} theme could not be applied`}
              />
            );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [
    storeId,
    businessId,
    uniqueCodeMachine,
    redirectTo,
    history,
    onSuccess,
    fetchThemeSettings,
  ]);

  return (
    <ThemeProvider theme={applyTheme(theme, themeSettings)}>
      {/* Reset the global styles to take the primary font from store settings */}
      <GlobalStyle />
      {loading ? <Loader /> : isFunction(children) ? children(themeSettings) : children}
    </ThemeProvider>
  );
};

WithTheme.propTypes = {
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  businessId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  uniqueCodeMachine: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  onSuccess: PropTypes.func,
};

WithTheme.defaultProps = {
  storeId: null,
  businessId: null,
  onSuccess: null,
};

export default WithTheme;
