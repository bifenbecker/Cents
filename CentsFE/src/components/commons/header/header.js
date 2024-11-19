import React, { Component } from 'react';
import {
  NavItem,
  NavLink,
  Dropdown,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Media from "react-media";

class Header extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.closeMenuHandler = this.closeMenuHandler.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  closeMenuHandler() {
    this.setState({
      dropdownOpen: false
    });
  }
  render() {
    return (
      <header className="header-container">
        <Media query="(max-width: 767px)">
          {matches =>
              matches ? (
                <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle} className="dropdown-mobile-menu list-unstyled">
                  <DropdownToggle className="dropdown-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <span className="close-menu" onClick={this.closeMenuHandler}>X</span>
                    <DropdownItem>
                    <NavItem>
                      <NavLink href="/">
                        Customers
                      </NavLink>
                    </NavItem>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : null
            }
        </Media>
        <h2 className="title-main title-page">cents</h2>
        <div className="user-options">
          <UncontrolledDropdown>
            <DropdownToggle className="btn-user-options">
              <span>
                <FontAwesomeIcon icon={faUser} />
              </span>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={this.props.handleLogout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </header>
    );
  }
}

export default Header;
