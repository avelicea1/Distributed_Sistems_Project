import React from "react";
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import {
    Button,
    Card,
    CardHeader,
    Col,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
} from "reactstrap";

import * as API_DEVICES from "./api/device-api";
import * as API_PERSONS from "../person/api/person-api"
import DeviceTable from "./components/device-table"
import DeviceForm from "./components/device-form";
import UpdateForm from "../device/components/update-form";
import AssignForm from "./components/assign-form";

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

const buttonStyle = {
    backgroundColor: "#54ce00",
    borderColor: "#327802",
    color: "white",
    borderRadius: "20px",
    padding: "10px 20px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
};

class DeviceContainer extends React.Component {
    constructor(props) {
        super(props);
        this.toggleAddForm = this.toggleAddForm.bind(this);
        this.toggleUpdateForm = this.toggleUpdateForm.bind(this);
        this.toggleAssignForm = this.toggleAssignForm.bind(this);
        this.reload = this.reload.bind(this);
        this.refresh = this.refresh.bind(this);

        this.state = {
            selected: false,
            collapseForm: false,
            tableData: [],
            persons: [],
            personsDevices: [],
            isLoaded: false,
            errorStatus: 0,
            error: null,
            selectedDevice: null,
            updateFormOpen: false,
            assignFormOpen: false,
        };
    }

    componentDidMount() {
        this.fetchDevices();
        this.fetchPersonsFromDevices();
        this.fetchPersons();
    }

    fetchDevices() {
        return API_DEVICES.getDevices((result, status, err) => {
            if (result !== null && status === 200) {
                this.setState({
                    tableData: result,
                    isLoaded: true,
                });
            } else {
                this.setState({
                    errorStatus: status,
                    error: err,
                });
            }
        })
    }

    fetchPersonsFromDevices() {
        return API_DEVICES.getPersons((result, status, err) => {
                if (result !== null && status === 200) {
                    this.setState({
                        personsDevices: result,
                        isLoaded: true,
                    });
                } else {
                    this.setState({
                        errorStatus: status,
                        error: err,
                    });
                }

            }
        )
    }
    fetchPersons(){
        return API_PERSONS.getPersons((result,status,err) => {
            if (result !== null && status === 200) {
                this.setState({
                    persons: result,
                    isLoaded: true,
                });
            } else {
                this.setState({
                    errorStatus: status,
                    error: err,
                });
            }
        })
    }


    toggleAddForm() {
        this.setState((prevState) => ({selected: !prevState.selected}));
    }

    toggleUpdateForm(device) {
        this.setState((prevState) => ({
            selectedDevice: device,
            updateFormOpen: !prevState.updateFormOpen,
        }));
    }

    toggleAssignForm(device) {
        this.setState((prevState) => ({
            selectedDevice: device,
            assignFormOpen: !prevState.assignFormOpen,
        }));
    }

    refresh() {
        this.fetchDevices();
        this.toggleAddForm();
    }

    reload() {
        this.setState({
            isLoaded: false,
            updateFormOpen: false,
            selectedDevice: null
        });
        this.fetchDevices();
    }

    deleteDevice(id){
        API_DEVICES.deleteDevice({id}, (status) => {
            if(status >= 200 && status <300){
                this.fetchDevices();
            }else{
                console.error("Failed to delete device");
            }
        });
    }

    render() {
        return (
            <div className="container mt-4">
                <Card style={cardStyle}>
                    <CardHeader style={cardHeaderStyle}>
                        <strong> Device Management </strong>
                    </CardHeader>

                    <br/>
                    <Row>
                        <Col
                            sm={{size: "8", offset: 2}}
                            className="d-flex justify-content-center"
                        >
                            <Button
                                style={buttonStyle}
                                onMouseOver={(e) =>
                                    (e.target.style.backgroundColor = "#327802")
                                }
                                onMouseOut={(e) => (e.target.style.backgroundColor = "#54ce00")}
                                onClick={this.toggleAddForm}
                            >
                                Add Device{" "}
                            </Button>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col sm={{size: "10", offset: 1}}>
                            {this.state.isLoaded && (
                                <DeviceTable
                                    key={JSON.stringify(this.state.tableData)}
                                    tableData={this.state.tableData}
                                    onDelete={(id) => this.deleteDevice(id)}
                                    onUpdate={this.toggleUpdateForm}
                                    onAssign={(device) => this.toggleAssignForm(device)}
                                />
                            )}
                            {this.state.errorStatus > 0 && (
                                <APIResponseErrorMessage
                                    errorStatus={this.state.errorStatus}
                                    error={this.state.error}
                                />
                            )}
                        </Col>
                    </Row>
                </Card>

                <Modal
                    isOpen={this.state.selected}
                    toggle={this.toggleAddForm}
                    className={this.props.className}
                    size="lg"
                >
                    <ModalHeader toggle={this.toggleAddForm}> Add Device: </ModalHeader>
                    <ModalBody>
                        <DeviceForm reloadHandler={this.refresh} persons={this.state.persons} personsDevices={this.state.personsDevices}/>
                    </ModalBody>
                </Modal>

                <Modal
                    isOpen={this.state.updateFormOpen}
                    toggle={() => this.toggleUpdateForm(null)}
                >
                    <ModalHeader toggle={() => this.toggleUpdateForm(null)}>
                        {" "}
                        Update Person:{" "}
                    </ModalHeader>
                    <ModalBody>
                        {this.state.selectedDevice && (
                            <UpdateForm
                                device={this.state.selectedDevice}
                                reloadHandler={this.reload}
                                toggleUpdateForm={() => this.toggleUpdateForm(null)}
                                persons = {this.state.persons}
                            />
                        )}
                    </ModalBody>
                </Modal>
                <Modal
                    isOpen={this.state.assignFormOpen}
                    toggle={this.toggleAssignForm}
                    className={this.props.className}
                    size="lg"
                >
                    <ModalHeader toggle={this.toggleAssignForm}>
                        Assign Person to Device
                    </ModalHeader>
                    <ModalBody>
                        {this.state.selectedDevice && (
                            <AssignForm
                                deviceId={this.state.selectedDevice.id}
                                persons={this.state.persons}
                                reloadHandler={this.reload}
                                toggle={this.toggleAssignForm}
                            />
                        )}
                    </ModalBody>
                </Modal>
            </div>
        );
    }


}

export default DeviceContainer;