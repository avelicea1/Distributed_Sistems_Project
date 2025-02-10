import React from "react";
import LoginForm from "./components/login-form";
import * as API_LOGIN from "./api/login-api";
import RegisterForm from "./components/register-form";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      loginError: null,
      isRegisterModalOpen: false,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleRegisterModal = this.toggleRegisterModal.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleLogin() {
    const { email, password } = this.state;
    API_LOGIN.login(email, password, (response) => {
      if (response) {
        sessionStorage.setItem("userEmail", email);
        let role = sessionStorage.getItem("role");
        let id = sessionStorage.getItem("id");
        this.props.onLoginSuccess(email, role, id);
        this.setState({ loginError: null });
      } else {
        window.alert("Invalid username or password");
        this.setState({ loginError: "Invalid username or password" });
      }
    });
  }

  toggleRegisterModal() {
    this.setState((prevState) => ({
      isRegisterModalOpen: !prevState.isRegisterModalOpen,
    }));
  }

  handleRegister(person) {
    API_LOGIN.register(person, (response) => {
      if (response && response.message) {
        alert(response.message);
        this.toggleRegisterModal();
      } else {
        alert("Registration failed. Please try again.");
      }
    });
  }

  render() {
    const { email, password, isRegisterModalOpen } = this.state;
    return (
        <div>
          <LoginForm
              onLogin={this.handleLogin}
              onChange={this.handleChange}
              email={email}
              password={password}
              toggleRegister={this.toggleRegisterModal}
          />

          <Modal isOpen={isRegisterModalOpen} toggle={this.toggleRegisterModal}>
            <ModalHeader toggle={this.toggleRegisterModal}>Register</ModalHeader>
            <ModalBody>
              <RegisterForm onRegister={this.handleRegister}/>
            </ModalBody>
          </Modal>
        </div>
    );
  }
}

export default LoginContainer;