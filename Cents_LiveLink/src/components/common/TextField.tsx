import materialWrapper from "./material-ui-wrapper/material-ui-wrapper";
import {Input} from "@rebass/forms/styled-components";
import {InputProps} from "@material-ui/core";
import {SxStyleProp} from "rebass/styled-components";
import {WrappedComponentProps} from "./material-ui-wrapper/types";

type ITextFieldTextProps = InputProps &
  WrappedComponentProps & {
    label?: string;
    materialWrapperStyle?: SxStyleProp;
    wrapperInputStyle?: SxStyleProp;
  };
const InputField = materialWrapper(Input);

const TextField = (props: ITextFieldTextProps) => {
  return <InputField {...props} />;
};

export default TextField;
