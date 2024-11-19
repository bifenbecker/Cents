import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import {Modal} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

class TabBar extends React.Component {
  constructor(props) {
    super(props);
    this.tabRef = React.createRef();
    this.state = {
      showTabRemoveConfirmation: false,
      deleteTabIndex: null,
    };
  }

  componentDidUpdate(prevProps) {
    // If the number of tabs increases, then automatically scroll to the last one.
    if (this.tabRef.current && prevProps?.tabs?.length < this.props?.tabs?.length) {
      this.tabRef.current.scrollLeft = this.tabRef.current.scrollWidth;
    }
  }

  handleTabClick = (index) => {
    if (this.props.tabChangeHandler) {
      this.props.tabChangeHandler(index);
    } else {
      console.warn("No handler provided for TabBar");
    }
  };

  openConfirmationPopup = (index, event) => {
    // Stop the event propagation so that this particular tab won't get selected.
    event.preventDefault();
    event.stopPropagation();

    this.setState({
      showTabRemoveConfirmation: true,
      deleteTabIndex: index,
    });
  };

  closeConfirmationPopup = () => {
    this.setState({
      showTabRemoveConfirmation: false,
      deleteTabIndex: null,
    });
  };

  confirmTabCloseConfirmation = (index) => {
    if (this.props.tabRemoveHandler) {
      this.props.tabRemoveHandler(index);
    }
    this.closeConfirmationPopup();
  };

  renderTabs = (tabs) => {
    if (!tabs) {
      return;
    }
    return tabs.map((tab, index) => {
      return (
        <div
          onClick={this.handleTabClick.bind(this, index)}
          className={cx(
            "tab",
            "tab-item",
            this.props.activeIndex === index ? "active" : ""
          )}
          key={`${tab}-${index}`}
        >
          <div className="tab-name">{tab || "--"}</div>
          {this.props.tabRemoveHandler ? (
            <div
              className="close-icon-wrapper"
              onClick={this.openConfirmationPopup.bind(this, index)}
            >
              <FontAwesomeIcon icon={faTimes} className="close-icon" />
            </div>
          ) : null}
        </div>
      );
    });
  };

  renderConfirmationModal = (index) => {
    return (
      <Modal
        isOpen
        toggle={this.closeConfirmationPopup.bind(this)}
        className="close-tab-confirmation-modal"
      >
        <div className="close-tab-confirmation-container">
          <p>{this.props.removeTabConfirmationMessage}</p>
          <button
            className="btn-rounded btn-theme ok-btn"
            onClick={this.confirmTabCloseConfirmation.bind(this, index)}
          >
            YES
          </button>
          <button
            className="btn btn-text cancel-button"
            onClick={this.closeConfirmationPopup.bind(this)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    );
  };

  render() {
    return (
      <div className="tab-bar" ref={this.tabRef}>
        {this.state.showTabRemoveConfirmation && this.state.deleteTabIndex !== null
          ? this.renderConfirmationModal(this.state.deleteTabIndex)
          : null}
        {this.renderTabs(this.props.tabs)}
        {this.props.showAddNewButton && (
          <button
            className="btn tab-item"
            style={{fontSize: "14px"}}
            onClick={() => {
              if (this.props.onAddNewClick) this.props.onAddNewClick();
            }}
          >
            {this.props.label}
          </button>
        )}
      </div>
    );
  }
}

TabBar.propTypes = {
  tabs: PropTypes.array.isRequired,
  activeIndex: PropTypes.number.isRequired,
  tabChangeHandler: PropTypes.func.isRequired,
  tabRemoveHandler: PropTypes.func,
  showAddNewButton: PropTypes.bool,
  onAddNewClick: PropTypes.func,
  removeTabConfirmationMessage: PropTypes.string,
  label: PropTypes.string,
};

TabBar.defaultProps = {
  removeTabConfirmationMessage: "Are you sure you want to remove this tab?",
  showAddNewButton: false,
  label: "+ Add New",
};

export default TabBar;
