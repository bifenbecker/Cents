import {TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  input: {
    "&::placeholder": {
      fontStyle: "italic",
      fontSize: 13,
      fontWeight: "400",
    },
  },
}));

export default function AddressConfirmTextField(props) {
  const classes = useStyles();
  return (
    <TextField
      fullWidth
      variant="outlined"
      multiline
      InputProps={{
        classes: {input: classes.input},
      }}
      InputLabelProps={{
        shrink: true,
        color: "primary",
      }}
      {...props}
    />
  );
}
