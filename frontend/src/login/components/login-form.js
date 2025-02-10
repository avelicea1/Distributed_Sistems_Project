import React, {useState} from "react";
import { Button, Form, FormGroup, Label, Input, Card, CardBody, InputGroup, InputGroupText } from "reactstrap";
import "./login-form.css";
import logo from "../../commons/images/icon.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = ({ onLogin, onChange, email, password, error, toggleRegister }) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onLogin();
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <CardBody className="text-center">
                    <img src={logo} alt="App Logo" className="app-logo" />
                    <h2 className="login-title">Welcome Back!</h2>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input
                                type="text"
                                name="email"
                                id="email"
                                value={email}
                                onChange={onChange}
                                required
                                placeholder="Enter your email"
                                className="input-field"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="password">Password</Label>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    placeholder="Enter your password"
                                    className="input-field"
                                />
                                <InputGroupText onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </InputGroupText>
                            </InputGroup>
                        </FormGroup>
                        <Button color="primary" block className="login-button">Login</Button>
                        {error && <p className="text-danger mt-2">{error}</p>} {/* Show error if exists */}
                    </Form>
                    <p className="mt-3">
                        Don't have an account?{" "}
                        <span
                            style={{ cursor: "pointer", color: "blue" }}
                            onClick={toggleRegister}
                        >
                            Register here
                        </span>
                    </p>
                </CardBody>
            </Card>
        </div>
    );
};

export default LoginForm;
