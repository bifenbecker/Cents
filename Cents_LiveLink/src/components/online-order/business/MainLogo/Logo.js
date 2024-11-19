import {Box} from "@material-ui/core";
import {Image} from "rebass/styled-components";
import useStyles from "./styles";

const Logo = ({logoUrl}) => {
  const {wrapper, logo} = useStyles();
  return (
    <Box className={wrapper}>
      <Image src={logoUrl} alt="Logo Image" className={logo} />
    </Box>
  );
};

export default Logo;
