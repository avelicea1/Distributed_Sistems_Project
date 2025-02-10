import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect,
} from "react-router-dom";
import NavigationBar from "./navigation-bar";
import Admin from "./pages/admin";
import PersonContainer from "./person/person-container";
import ErrorPage from "./commons/errorhandling/error-page";
import styles from "./commons/styles/project-style.css";
import LoginContainer from "./login/login-container";
import DeviceContainer from "./device/device-container"
import ClientContainer from "./pages/client";
import WebSocketService from './webSocket/wb';
import ChatPage from "./chat/chatPage";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            userEmail: "",
            role: "",
            isLoading: true,
            alerts: []
        };
        console.log(this.state.isLoggedIn);
    }

    componentDidMount() {
        const token = sessionStorage.getItem("jwtToken");
        const userEmail = sessionStorage.getItem("userEmail");
        const role = sessionStorage.getItem("role");

        console.log("Checking user session...");
        console.log("Token:", token);
        console.log("Email:", userEmail);
        console.log("Role:", role);
        setTimeout(() => {
            if (token) {
                this.setState({
                    isLoggedIn: true,
                    userEmail: userEmail || "",
                    role: role || "",
                    isLoading: false,
                });
                WebSocketService.setMessageHandler(this.handleAlertMessage);
                WebSocketService.connect();
            } else {
                this.setState({ isLoading: false });
            }
        }, 200);
    }

    handleAlertMessage = (message) => {
        this.setState((prevState) => ({
            alerts: [...prevState.alerts, message]
        }));

    };


    handleLoginSuccess = (email, role, id) => {
        this.setState({ isLoggedIn: true, userEmail: email, role: role }, () => {
            console.log("role on login", role);
            console.log("Login successful:", this.state);
            sessionStorage.setItem("role", role);
            sessionStorage.setItem("id", id);
        });
    };

    logout = () => {
        sessionStorage.removeItem("jwtToken");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("id");
        this.setState({ isLoggedIn: false, userEmail: "", role: "" });
        WebSocketService.disconnect();
    };

    render() {
        const { isLoggedIn, userEmail, role, isLoading, alerts } = this.state;
        if (isLoading) {
            return <div className={styles.loading}>Loading...</div>;
        }
        return (
            <Router>
                <div className={styles.back}>
                    {isLoggedIn && (
                        <NavigationBar
                            onLogout={this.logout}
                            userEmail={userEmail}
                            role={role}
                        />
                    )}

                    <Switch>
                        <Route path="/" exact>
                            {isLoggedIn ? (
                                <Redirect to={role === "ADMIN" ? "/admin" : "/client"} />
                            ) : (
                                <LoginContainer onLoginSuccess={this.handleLoginSuccess} />
                            )}
                        </Route>

                        <Route
                            path="/admin"
                            render={() =>
                                isLoggedIn && role === "ADMIN" ? <Admin /> : <Redirect to="/" />
                            }
                        />
                        <Route
                            path="/client"
                            render={() => {
                                if (isLoggedIn && role === "ADMIN") {
                                    return <Redirect to="/admin" />;
                                }
                                return isLoggedIn && role === "CLIENT" ? (
                                    <ClientContainer alerts={alerts} />
                                ) : (
                                    <Redirect to="/" />
                                );
                            }}
                        />
                        <Route
                            path="/person"
                            render={() =>
                                isLoggedIn && role === "ADMIN" ? (
                                    <PersonContainer />
                                ) : (
                                    <Redirect to="/" />
                                )
                            }
                        />
                        <Route
                            path="/chat"
                            render={() =>
                                isLoggedIn ? (
                                    <ChatPage currentUser={sessionStorage.getItem("id")} />
                                ) : (
                                    <Redirect to="/" />
                                )
                            }
                        />
                        <Route
                            path="/device"
                            render={() =>
                                isLoggedIn && role === "ADMIN" ? (
                                    <DeviceContainer />
                                ) : (
                                    <Redirect to="/" />
                                )
                            }
                        />
                        <Route path="/error" render={() => <ErrorPage />} />
                        <Route render={() => <ErrorPage />} />
                    </Switch>
                </div>
            </Router>
        );
    }
    removeAlert(index) {
        this.setState((prevState) => {
            const updatedAlerts = [...prevState.alerts];
            updatedAlerts.splice(index, 1);
            return { alerts: updatedAlerts };
        });
    }
}

export default App;
