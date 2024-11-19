import {ForwardedRef, ReactNode} from "react";
import {TextFieldProps} from "@material-ui/core/TextField";
import {InputProps, TextareaProps} from "@rebass/forms";

export type WrappedComponentProps = {
  forwardedRef?: ForwardedRef<unknown>;
  materialWrapperStyle?: Record<string, unknown>;
  wrapperInputStyle?: Record<string, unknown>;
  themeStyles?: Record<string, unknown>;
  smallHeight?: boolean;
  isInline?: boolean;
  suffix?: ReactNode;
} & Partial<TextFieldProps> &
  Partial<InputProps> &
  Partial<TextareaProps>;
