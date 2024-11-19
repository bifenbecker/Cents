import React, {ChangeEvent, FocusEvent, ComponentType, useEffect, useState} from "react";
import _ from "lodash";
import {Box, Flex, Text} from "rebass/styled-components";
import {InputProps, TextareaProps} from "@rebass/forms";
import {WrappedComponentProps} from "./types";

const isClassComponent = (component: ComponentType<unknown>) => {
  return typeof component === "function" && !!component.prototype.isReactComponent;
};

const isFunctionComponent = (component: ComponentType<unknown>) => {
  return (
    typeof component === "function" &&
    String(component).includes("return React.createElement")
  );
};

const isReactComponent = (component: ComponentType<unknown>) =>
  isClassComponent(component) || isFunctionComponent(component);

interface MaterialWrapperOptions {
  type: "input" | "textarea";
}

const MaterialWrapper = (
  WrappedComponent: ComponentType<InputProps> | ComponentType<TextareaProps>,
  options?: MaterialWrapperOptions
) => {
  const {type = "input"} = options ?? {};

  const WrappedMaterialComponent = ({forwardedRef, ...props}: WrappedComponentProps) => {
    const [isInFocus, setIsInFocus] = useState(false);
    const [shake, setShake] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);

    // Use the forwardedRef if it is available, or create a new local ref?
    const inputControl = forwardedRef || React.createRef();

    useEffect(() => {
      setIsEmpty(!((props.defaultValue || props.value) && props.value !== ""));
    }, [props.defaultValue, props.value]);

    const handleChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Passing on the event to parents handler
      if (props.onChange) {
        props.onChange(evt);
      }

      // If the value is there, then it is not empty.
      setIsEmpty(!_.get(evt, "target.value"));
    };

    const handleFocusChange = (inFocus: boolean) => {
      if (!inFocus && props.error) {
        // Shake once
        setShake(true);

        setTimeout(() => {
          setShake(false);
        }, 500);
      }
      setIsInFocus(inFocus);
    };

    const handleFocus = (evt: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleFocusChange(true);
      if (props.onFocus) {
        props.onFocus(evt);
      }
    };

    const handleBlur = (evt: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleFocusChange(false);
      if (props.onBlur) {
        props.onBlur(evt);
      }
    };

    const getValidProps = (props: Pick<any, string | number | symbol>) => {
      let validProps: Record<string, any> = {};
      if (isReactComponent(WrappedComponent as ComponentType<unknown>)) {
        validProps = {...props};
      } else {
        for (const prop in props) {
          if (prop.toLowerCase() === prop) {
            validProps[prop] = props[prop];
          }
        }
      }

      validProps = {
        ...validProps,
        className: undefined,
        error: undefined,
        onChange: undefined,
        onBlur: undefined,
        onFocus: undefined,
      };

      return validProps;
    };

    return (
      <Box
        className={[
          "material-like-text-field",
          shake ? "shake" : "",
          isInFocus ? "active" : "",
          props.error ? "error" : "",
          props.className || "",
          props.smallHeight && "small",
          props.isInline ? "inline" : "",
          props.disabled ? "disabled" : "",
        ]
          .filter(cx => cx)
          .join(" ")}
        onClick={() => {
          if (inputControl) {
            (inputControl as any).current.focus();
          }
        }}
        {...props.materialWrapperStyle}
      >
        <div className="prefix">{props.prefix}</div>

        <Flex sx={{width: "100%"}} alignItems="center">
          <Text
            className={`label type-${type} ${isEmpty ? "" : "move-top"}`}
            onClick={() => {
              if (inputControl) {
                (inputControl as any).current.focus();
              }
            }}
            fontFamily="primary"
          >
            {isInFocus || props.value || !props.placeholder
              ? props.label
              : props.placeholder}
          </Text>
          <WrappedComponent
            {...getValidProps(props)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            defaultValue={props.defaultValue}
            type={props.type || "text"}
            value={props.value}
            ref={inputControl}
            name={props.name}
            maxLength={props.maxLength}
            style={props.wrapperInputStyle || {}}
            {...props.themeStyles}
          />
          <div className="suffix">{props.suffix}</div>
        </Flex>
      </Box>
    );
  };

  return React.forwardRef<unknown, WrappedComponentProps>((props, ref) => {
    return <WrappedMaterialComponent {...props} forwardedRef={ref} />;
  });
};

export default MaterialWrapper;
