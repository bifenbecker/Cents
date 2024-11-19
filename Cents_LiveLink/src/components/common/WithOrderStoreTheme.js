import React, {useEffect, useState} from "react";
import {ThemeProvider} from "styled-components";
import {toast} from "react-toastify";
import isFunction from "lodash/isFunction";
import PropTypes from "prop-types";

import {fetchStoreSettings} from "../../api/order";
import {getStoreTheme} from "../../utils/theme";
import theme from "../../theme";

import {GlobalStyle, Loader} from ".";

import ToastError from "../common/ToastError";

// const testKinTheme = {
//   borderRadius: "4px",
//   primaryColor: "#000000",
//   secondaryColor: "#FFFFFF",
//   boldFont: "Verlag Black",
//   normalFont: "Verlag Book",
//   logoUrl: "https://cents-product-images.s3.us-east-2.amazonaws.com/Logo_Kin.svg",
// };

const WithOrderStoreTheme = props => {
  const {orderToken, children} = props;

  const [storeSettings, setStoreSettings] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storeRes = await fetchStoreSettings({token: orderToken});
        setStoreSettings(storeRes?.data);
      } catch (error) {
        const errMsg = error.response?.data.error || error.message;
        console.warn(errMsg);
        if (error?.response?.status !== 401) {
          toast.error(<ToastError message={"Store settings could not be applied"} />);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [orderToken]);

  return (
    <ThemeProvider theme={getStoreTheme(theme, storeSettings)}>
      {/* Reset the global styles to take the primary font from store settings */}
      <GlobalStyle />
      {loading ? <Loader /> : isFunction(children) ? children(storeSettings) : children}
    </ThemeProvider>
  );
};

WithOrderStoreTheme.propTypes = {
  orderToken: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
};

export default WithOrderStoreTheme;
