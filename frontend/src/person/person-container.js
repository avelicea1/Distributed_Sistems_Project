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
import PersonForm from "./components/person-form";

import * as API_USERS from "./api/person-api";
import PersonTable from "./components/person-table";
import UpdateForm from "./components/update-form";

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

class PersonContainer extends React.Component {
    constructor(props) {
        super(props);
        this.toggleAddForm = this.toggleAddForm.bind(this);
        this.toggleUpdateForm = this.toggleUpdateForm.bind(this);
        this.reload = this.reload.bind(this);
        this.refresh = this.refresh.bind(this);
        this.state = {
            selected: false,
            collapseForm: false,
            tableData: [],
            isLoaded: false,
            errorStatus: 0,
            error: null,
            selectedPerson: null,
            updateFormOpen: false,
        };
    }

    componentDidMount() {
        this.fetchPersons();
    }

    fetchPersons() {
        return API_USERS.getPersons((result, status, err) => {
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
        });
    }

    toggleAddForm() {
        this.setState((prevState) => ({selected: !prevState.selected}));
    }

    toggleUpdateForm(person) {
        this.setState((prevState) => ({
            selectedPerson: person,
            updateFormOpen: !prevState.updateFormOpen,
        }));
    }

    refresh() {
        this.fetchPersons();
        this.toggleAddForm();
    }

    reload() {
        this.setState({
            isLoaded: false,
            updateFormOpen: false,
            selectedPerson: null
        });
        this.fetchPersons();
    }

    deletePerson(id) {
        API_USERS.deletePerson({id}, (status) => {
            if (status >= 200 && status < 300) {
                this.fetchPersons();
            } else {
                console.error("Failed to delete person");
            }
        });
    }

    render() {
        return (
            <div className="container mt-4">
                <Card style={cardStyle}>
                    <CardHeader style={cardHeaderStyle}>
                        <strong> Person Management </strong>
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
                                    (e.target.style.backgroundColor = "#54ce00")
                                }
                                onMouseOut={(e) => (e.target.style.backgroundColor = "#327802")}
                                onClick={this.toggleAddForm}
                            >
                                Add Person{" "}
                            </Button>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col sm={{size: "10", offset: 1}}>
                            {this.state.isLoaded && (
                                <PersonTable
                                    key={JSON.stringify(this.state.tableData)}
                                    tableData={this.state.tableData}
                                    onDelete={(id) => this.deletePerson(id)}
                                    onUpdate={this.toggleUpdateForm}
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
                    <ModalHeader toggle={this.toggleAddForm}> Add Person: </ModalHeader>
                    <ModalBody>
                        <PersonForm reloadHandler={this.refresh}/>
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
                        {this.state.selectedPerson && (
                            <UpdateForm
                                person={this.state.selectedPerson}
                                reloadHandler={this.reload}
                                toggleUpdateForm={() => this.toggleUpdateForm(null)}
                            />
                        )}
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

export default PersonContainer;