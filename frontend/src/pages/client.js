import React from "react";
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import {
    Card,
    CardHeader,
    Col,
    Row,
    Button
} from "reactstrap";

import * as API_DEVICES from "../device/api/device-api";
// import * as API_USERS from "../person/api/person-api";
import DeviceTable from "../device/components/device-table";
import EnergyConsumptionChart from "../webSocket/energyChart";
import { Spinner, Toast, ToastBody, ToastHeader } from "react-bootstrap";
import WebSocketService from '../webSocket/wb';
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css";

// import ChatComponent from '../chat/chat';
import ChatPage from "../chat/chatPage";

const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    backgroundColor: "#f9f9f9",
};

const cardHeaderStyle = {
    backgroundColor: "#327802",
    color: "white",
    borderRadius: "12px 12px 0 0",
    padding: "15px",
    fontSize: "1.25rem",
    textAlign: "center",
};

const sidebarStyle = {
    position: "fixed",
    top: "0",
    right: "0",
    zIndex: 1000,
    height: "100vh",
    width: "300px",
    backgroundColor: "#f8f9fa",
    boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    overflowY: "auto",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease-in-out"
};

const sidebarOpenStyle = {
    ...sidebarStyle,
    transform: "translateX(0)"
};

const chartContainerStyle = {
    marginTop: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    padding: "20px",
    height: "600px",
};

const chartHeaderStyle = {
    fontSize: "1.5rem",
    color: "#327802",
    fontWeight: "bold",
    marginBottom: "20px",
};

const loadingSpinnerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
};

const notificationIndicatorStyle = {
    position: "absolute",
    top: "5px",
    right: "5px",
    width: "8px",
    height: "8px",
    backgroundColor: "red",
    borderRadius: "50%",
};


class ClientContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            isLoaded: false,
            errorStatus: 0,
            error: null,
            selectedDeviceId: null,
            notifications: props.alerts || [],
            users: [],
            showSidebar: false,
            showChart: false,
            selectedDate: new Date(),
            showChat: false,
            currentUser: sessionStorage.getItem("id"),
            selectedUser: null
        };

    }

    componentDidUpdate(prevProps) {
        if (prevProps.alerts !== this.props.alerts) {
            const newNotifications = this.props.alerts.filter(alert =>
                !this.state.notifications.includes(alert)
            );
            this.setState(prevState => ({
                notifications: [...prevState.notifications, ...newNotifications]
            }));
        }
    }

    componentWillUnmount() {
        WebSocketService.disconnect();
    }

    handleDeviceSelect = (deviceId) => {
        this.setState({ selectedDeviceId: deviceId, showChart: true });
        console.log("Selected Device ID in client:", deviceId);
        WebSocketService.connect(deviceId);
    };

    handleDateChange = (date) => {
        this.setState({ selectedDate: date }, () => {
            this.fetchEnergyDataForDate();
        });
    };


    fetchEnergyDataForDate = () => {
        const { selectedDate, selectedDeviceId } = this.state;
        if (selectedDeviceId && selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            WebSocketService.triggerConsumptionDataRequest(selectedDeviceId, formattedDate);
        }
    };


    toggleSidebar = () => {
        this.setState(prevState => ({
            showSidebar: !prevState.showSidebar,
        }));
    };

    toggleChat = () => {
        this.setState(prevState => ({
            showChat: !prevState.showChat,
        }));
    };

    closeNotification = (index) => {
        this.setState(prevState => {
            const updatedNotifications = [...prevState.notifications];
            updatedNotifications.splice(index, 1);
            return { notifications: updatedNotifications };
        });
    };

    closeChart = () => {
        this.setState({ showChart: false });
    };


    componentDidMount() {
        const personId = sessionStorage.getItem("id");
        if (personId) {
            this.fetchDevicesForPerson(personId);
            //this.fetchAllUsers();
        } else {
            this.setState({ errorStatus: 404, error: "No person ID found in local storage." });
        }
    }


    fetchDevicesForPerson(personId) {
        return API_DEVICES.getDevicesForPerson(personId, (result, status, err) => {
            if (result !== null && status === 200) {
                this.setState({
                    tableData: result,
                    isLoaded: true,
                });
            } else {
                this.setState({
                    tableData: [],
                    errorStatus: status,
                    error: err,
                });
            }
        });
    }

    // fetchAllUsers() {
    //     API_USERS.getPersons((result, status, err) => {
    //         if (result !== null && status === 200) {
    //             this.setState({ users: result });
    //         } else {
    //             this.setState({ errorStatus: status, error: err });
    //         }
    //     });
    // }

    handleUserSelect = (user) => {
        this.setState({ selectedUser: user, showChat: true });  // Set the selected user and open chat
    };

    render() {
        const { users, notifications, showSidebar, selectedDeviceId, showChart, selectedDate, selectedUser, currentUser } = this.state;
        const hasNewNotifications = notifications.length > 0;

        return (
            <div className="container mt-4">
                <div id="alertContainer"></div>
                <Card style={cardStyle}>
                    <CardHeader style={cardHeaderStyle}>
                        <strong>Devices for Person</strong>
                    </CardHeader>

                    <Button
                        onClick={this.toggleSidebar}
                        style={{ position: "fixed", top: "20px", right: "300px", zIndex: 1000, padding: "10px 20px" }}
                    >
                        Notifications
                        {hasNewNotifications && <span style={notificationIndicatorStyle}></span>}
                    </Button>

                    <div
                        style={showSidebar ? sidebarOpenStyle : sidebarStyle}
                    >
                        <h5>Notifications</h5>
                        {notifications.length === 0 ? (
                            <p>No new notifications.</p>
                        ) : (
                            notifications.map((alert, index) => (
                                <Toast key={index} style={{ marginBottom: "10px" }} onClose={() => this.closeNotification(index)}>
                                    <ToastHeader>
                                        New Notification
                                    </ToastHeader>
                                    <ToastBody>{alert}</ToastBody>
                                </Toast>
                            ))
                        )}
                        {/* <h5>Select a User to Chat</h5>
                        {users.length === 0 ? (
                            <p>No users available.</p>
                        ) : (
                            <ul>
                                {users.map(user => (
                                    <li key={user.id} onClick={() => this.handleUserSelect(user)}>
                                        {user.name}
                                    </li>
                                ))}
                            </ul>
                        )} */}
                    </div>

                    <Row>
                        <Col sm={{ size: "10", offset: 1 }}>
                            {this.state.isLoaded && this.state.tableData && (
                                <>
                                    <DeviceTable
                                        key={JSON.stringify(this.state.tableData)}
                                        tableData={this.state.tableData}
                                        role={this.state.role}
                                        onDeviceSelect={this.handleDeviceSelect}
                                    />
                                    {showChart && selectedDeviceId && (
                                        <div style={chartContainerStyle}>
                                            <div style={chartHeaderStyle}>
                                                Energy Consumption for Device
                                                <Button size="sm" onClick={this.closeChart} style={{ position: "absolute", right: 100 }}>
                                                    X
                                                </Button>
                                            </div>
                                            {this.state.isLoaded ? (
                                                <>
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={this.handleDateChange}
                                                        dateFormat="yyyy/MM/dd"
                                                        className="custom-datepicker" // Apply custom class for styling
                                                    />
                                                    <EnergyConsumptionChart deviceId={this.state.selectedDeviceId} selectedDate={selectedDate} />
                                                </>
                                            ) : (
                                                <div style={loadingSpinnerStyle}>
                                                    <Spinner color="primary" />
                                                </div>
                                            )}
                                        </div>
                                    )}</>


                            )}
                            {this.state.errorStatus > 0 && (
                                <APIResponseErrorMessage
                                    errorStatus={this.state.errorStatus}
                                    error={this.state.error}
                                />
                            )}
                        </Col>
                    </Row>
                    {/* <Button onClick={this.toggleChat} style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
                        Chat
                    </Button>

                    {this.state.showChat && (
                        <div >
                            <ChatPage currentUser={currentUser} />
                        </div>
                    )} */}
                </Card>
            </div>
        );
    }
}

export default ClientContainer;
