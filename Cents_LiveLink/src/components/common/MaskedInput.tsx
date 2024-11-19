import {useEffect, useRef} from "react";
import {Input, InputProps} from "@rebass/forms/styled-components";
import InputMask, {Props} from "react-input-mask";

type MaskedInputProps = Omit<InputProps, "style"> & {
  sx?: Record<string, string[]>;
  maskProps?: any;
} & Omit<Props, "style" | "width">;

const MaskedInput = ({
  onChange,
  mask,
  value = "",
  sx = {},
  maskProps = {},
  ...rest
}: MaskedInputProps) => {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <InputMask
      alwaysShowMask
      onChange={onChange}
      value={value}
      mask={mask}
      {...maskProps}
    >
      {(inputProps: JSX.IntrinsicAttributes & InputProps) => (
        <Input
          {...styles.input}
          {...inputProps}
          sx={{...styles.input.sx, ...sx}}
          ref={inputRef}
          {...rest}
        />
      )}
    </InputMask>
  );
};

const styles = {
  input: {
    width: ["100%", "100%", "100%", "50%"],
    fontWeight: 600,
    sx: {
      textAlign: ["center", "center", "center", "center"],
      fontSize: "2rem",
      border: "none",
      outline: "none",
    },
  },
};

export default MaskedInput;
