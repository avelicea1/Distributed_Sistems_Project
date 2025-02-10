import React from "react";
import logo from "./commons/images/icon.png";
import chatLogo from "./commons/images/chat.png"; // Add your chat icon image here
import userIcon from "./commons/images/user-icon.png";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";

const navBarStyle = {
  backgroundColor: "#1F1F1F",
  padding: "10px 30px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const logoStyle = {
  width: "45px",
  height: "auto",
  marginRight: "15px",
};

const leftNavContainerStyle = {
  display: "flex",
  alignItems: "center",
};

const textStyle = {
  color: "#ffffff",
  fontSize: "1.1rem",
  fontWeight: "500",
  textDecoration: "none",
  transition: "color 0.3s ease",
  marginRight: "15px",
};

const dropdownMenuStyle = {
  backgroundColor: "#2C2C2C",
  borderRadius: "8px",
  border: "none",
  padding: "10px 0",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

const dropdownItemStyle = {
  color: "#ffffff",
  padding: "10px 20px",
  fontSize: "1rem",
  fontWeight: "400",
  transition: "background-color 0.3s ease, color 0.3s ease",
};

const emailStyle = {
  color: "#ffffff",
  fontSize: "0.9rem",
  marginLeft: "10px",
  display: "flex",
  alignItems: "center",
};

const userIconStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  cursor: "pointer",
  marginRight: "8px",
};

const chatIconStyle = {
  width: "25px",
  height: "auto",
  marginRight: "10px",
};

const NavigationBar = ({ onLogout, userEmail, role }) => (
  <div>
    <Navbar expand="md" style={navBarStyle}>
      <div style={leftNavContainerStyle}>
        <NavbarBrand href="/">
          <img src={logo} alt="Logo" style={logoStyle} />
        </NavbarBrand>
        <Nav navbar>
          <NavLink href="/chat" style={textStyle}>
            <img src={chatLogo} alt="Chat Icon" style={chatIconStyle} />
            Chat
          </NavLink>
        </Nav>
      </div>
      <Nav className="ml-auto" navbar>
        {role === "ADMIN" && (
          <>
            <NavLink href="/person" style={textStyle}>
              Persons
            </NavLink>
            <NavLink href="/device" style={textStyle}>
              Devices
            </NavLink>
          </>
        )}
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={userIcon} alt="User Icon" style={userIconStyle} />
              <span style={emailStyle}>{userEmail}</span>
              <span style={emailStyle}>({role})</span>
            </div>
          </DropdownToggle>
          <DropdownMenu right style={dropdownMenuStyle}>
            <DropdownItem style={dropdownItemStyle} onClick={onLogout}>
              Logout
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </Navbar>
  </div>
);

export default NavigationBar;
