import {Redirect, Route, Switch, useRouteMatch} from "react-router-dom";
import {useSelector} from "react-redux";
import {createTheme, ThemeProvider} from "@material-ui/core/styles";
import {PrivateRoute} from "hoc";
import {BusinessWithBusinessId} from "./business";
import {OnlineOrderWithBusinessId} from "./business/online-order-form";
import {getOrderInitialData} from "./redux/selectors";
import {applyTheme, getFilterClass} from "utils/theme";
import defaultTheme from "theme";
import {typography} from "components/online-order/orderTheme";
import {ScheduleMain} from "./business/schedule/ScheduleMain";

const OnlineOrder = () => {
  const {path} = useRouteMatch();

  const {
    data: {theme},
  } = useSelector(getOrderInitialData);
  const filterClass = getFilterClass(theme?.primaryColor);
  const joinedTheme = applyTheme(defaultTheme, theme);
  const muiTheme = createTheme({...joinedTheme, ...typography, filterClass});

  return (
    <ThemeProvider theme={muiTheme}>
      <Switch>
        <Route
          path={`${path}/business/:businessId`}
          exact
          component={BusinessWithBusinessId}
        />
        <PrivateRoute
          path={`${path}/business/:businessId/schedule`}
          exact
          component={ScheduleMain}
        />
        <PrivateRoute
          path={`${path}/business/:businessId/new`}
          exact
          component={OnlineOrderWithBusinessId}
        />
        <Route
          path={`${path}/business/:businessId/:storeId`}
          exact
          component={BusinessWithBusinessId}
        />
        <PrivateRoute
          path={`${path}/business/:businessId/:storeId/schedule`}
          exact
          component={ScheduleMain}
        />
        <PrivateRoute
          path={`${path}/business/:businessId/:storeId/new`}
          exact
          component={OnlineOrderWithBusinessId}
        />
        <Redirect to="/" />
      </Switch>
    </ThemeProvider>
  );
};

export default OnlineOrder;
