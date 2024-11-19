import React, { Component } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Media from "react-media";

class SidebarMenu extends Component {
  render() {
    return (
      <Media query="(min-width: 767px)">
        {
          matches => matches ? (
            <div className="sidebar-menu">
              <Nav className="sidebar">
                <NavItem>
                  <NavLink href="/">
                    <span>
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          ) : null
        }
      </Media>
    );
  }
}

export default SidebarMenu;
