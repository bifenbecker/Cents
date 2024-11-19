import {InputAdornment, CircularProgress} from "@material-ui/core";

const LoadingIcon = () => {
  return (
    <InputAdornment position="end" style={{margin: 0}}>
      <CircularProgress size="1rem" />
    </InputAdornment>
  );
};

export default LoadingIcon;
