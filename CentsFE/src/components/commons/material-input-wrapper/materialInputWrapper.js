import React from "react";
import _ from "lodash";
import ReactSelect from "react-select";
import AsyncSelect from "react-select/async";
import {isReactComponent} from "../../../utils/functions";

function MaterialWrapper(WrappedComponent, options = {}) {
  class WrappedMaterialComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isInFocus: false,
        shake: false,
        isEmpty: true,
        additionalProps: {},
        wrapperInFocus: false,
      };
      if (options.type === "DATE_RANGE") {
        this.state.isEmpty = false;
      }
      this.inputControl = this.props.forwardedRef || React.createRef();
    }

    focus() {
      if (this.inputControl) {
        this.inputControl.focus();
      }
    }

    componentDidMount() {
      this.checkAndSetIsEmpty();
      if (
        WrappedComponent.prototype === ReactSelect.prototype ||
        WrappedComponent.prototype === AsyncSelect.prototype
      ) {
        let className = `material-react-select ${this.props.smallHeight && "small"}`;
        this.setState({
          additionalProps: {
            classNamePrefix: "material-react-select",
            className,
          },
        });
      }
    }

    componentDidUpdate(prevProps) {
      if (this.props.value !== prevProps.value) {
        this.checkAndSetIsEmpty();
      }
    }

    checkAndSetIsEmpty() {
      if ((this.props.defaultValue || this.props.value) && this.state.isEmpty) {
        this.setState({
          isEmpty: false,
        });
      } else if (this.props.value === "") {
        this.setState({
          isEmpty: true,
        });
      }
    }

    handleChange = (evt) => {
      // Passing on the event to parents handler
      if (this.props.onChange) {
        this.props.onChange(evt);
      }

      let isReactSelect = WrappedComponent.prototype === ReactSelect.prototype;

      if (_.get(evt, "target.value") || (isReactSelect && evt)) {
        this.setState({
          isEmpty: false,
        });
      } else {
        this.setState({
          isEmpty: true,
        });
      }
    };

    handleKeyPress = (evt) => {
      if (this.props.onKeyPress) {
        this.props.onKeyPress(evt);
      }
    };

    handleFocusChange = (isInFocus) => {
      if (!isInFocus && this.props.error) {
        // Shake once
        this.setState({
          shake: true,
        });

        setTimeout(() => {
          this.setState({
            shake: false,
          });
        }, 500);
      }
      this.setState({
        isInFocus,
      });
    };

    handleBlur = (evt) => {
      if (!this.props.isWrappedComponent) {
        this.handleFocusChange(false);
      }
      if (this.props.onBlur) {
        this.props.onBlur(evt);
      }
    };

    getValidProps = (props) => {
      let validProps = {};
      if (
        isReactComponent(WrappedComponent) ||
        isReactComponent(WrappedComponent.WrappedComponent) || // since DateRangePicker is forwardRef component it might not have a prototype, use WrappedComponent property in this case
        options.type === "TIME_RANGE"
      ) {
        validProps = {...props};
      } else {
        for (const prop in props) {
          if (prop.toLowerCase() === prop) {
            validProps[prop] = props[prop];
          }
        }
      }
      if (options.type === "DATE_RANGE") {
        validProps = {
          ...validProps,
        };
        delete validProps.className;
        delete validProps.classNamePrefix;
        delete validProps.label;
        return validProps;
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
    updateMaterialWrapperFocus = (value) => {
      this.setState({wrapperInFocus: !value});
    };
    render() {
      return (
        <div
          className={`
                        material-like-text-field
                        ${this.state.isInFocus ? "active" : ""} 
                        ${this.state.wrapperInFocus ? "active" : ""} 
                        ${this.props.error ? "error" : ""}
                        ${this.props.className || ""}
                        ${this.props.smallHeight && "small"}
                        ${this.props.isInline ? "inline" : ""}
                        ${this.props.disabled ? "disabled" : ""}
                        ${this.state.shake ? "shake" : ""}
                        `}
          onClick={() => {
            if (this.inputControl && !this.props.isWrappedComponent) {
              this.inputControl.current && this.inputControl.current.focus();
            }
          }}
        >
          <div
            className={`label ${this.state.isEmpty ? "" : "move-top"}`}
            onClick={() => {
              if (this.inputControl) {
                this.inputControl.current && this.inputControl.current.focus();
              }
            }}
          >
            {this.state.isEmpty && !this.state.isInFocus
              ? this.props.label
              : this.props.focusedLabel || this.props.label}
          </div>

          {options.type !== "DATE_RANGE" && options.type !== "TIME_RANGE" && (
            <div className="prefix">{this.props.prefix}</div>
          )}
          {options.type !== "DATE_RANGE" && options.type !== "TIME_RANGE" && (
            <WrappedComponent
              {...this.getValidProps(this.props)}
              onFocus={() => {
                if (!this.props.isWrappedComponent) {
                  this.handleFocusChange(true);
                }
              }}
              onKeyPress={this.handleKeyPress}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              defaultValue={this.props.defaultValue}
              type={this.props.type || "text"}
              value={this.props.value}
              ref={this.inputControl}
              name={this.props.name}
              maxLength={this.props.maxLength}
              {...this.state.additionalProps}
            ></WrappedComponent>
          )}
          {options.type === "DATE_RANGE" && (
            <WrappedComponent {...this.getValidProps(this.props)} minimumNights={0} />
          )}
          {options.type === "TIME_RANGE" && (
            <WrappedComponent
              {...this.getValidProps(this.props)}
              updateMaterialWrapperFocus={this.updateMaterialWrapperFocus}
            />
          )}
          {!this.props.hideSuffixOnBlur || this.state.isInFocus || !this.state.isEmpty ? (
            <div className="suffix">{this.props.suffix}</div>
          ) : null}
        </div>
      );
    }
  }
  return React.forwardRef((props, ref) => {
    return <WrappedMaterialComponent {...props} forwardedRef={ref} />;
  });
}

export default MaterialWrapper;
