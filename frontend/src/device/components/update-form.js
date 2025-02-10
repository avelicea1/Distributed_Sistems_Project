import React from "react";
import validate from "./validators/device-validator";
import Button from "react-bootstrap/Button";
import * as API_DEVICES from "../api/device-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";
import {Col, Row} from "reactstrap";
import {FormGroup, Input, Label} from "reactstrap";

class UpdateForm extends React.Component {
    constructor(props) {
        super(props);
        this.toggleForm = this.toggleForm.bind(this);
        this.reloadHandler = this.props.reloadHandler;

        this.state = {
            errorStatus: 0,
            error: null,

            formIsValid: false,

            formControls: {
                description: {
                    value: this.props.device.description,
                    placeholder: "Description...",
                    valid: true,
                    touched: true,
                    validationRules: {
                        minLength: 3,
                        isRequired: true,
                    },
                },
                address: {
                    value: this.props.device.address,
                    placeholder: "Cluj, Zorilor, Str. Lalelelor 21...",
                    valid: true,
                    touched: true,
                },
                mhc: {
                    value: this.props.device.mhc,
                    placeholder: "MHC.. ",
                    valid: true,
                    touched: true
                },
                person: {
                    value: null,
                    placeholder: "Choose Person ...",
                    valid: true,
                    touched: true
                },
            },
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    toggleForm() {
        this.setState({collapseForm: !this.state.collapseForm});
    }

    handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        const updatedControls = this.state.formControls;

        const updatedFormElement = updatedControls[name];

        updatedFormElement.value = value;
        updatedFormElement.touched = true;
        updatedFormElement.valid = validate(
            value,
            updatedFormElement.validationRules
        );
        updatedControls[name] = updatedFormElement;

        let formIsValid = true;
        for (let updatedFormElementName in updatedControls) {
            formIsValid =
                updatedControls[updatedFormElementName].valid && formIsValid;
        }

        this.setState({
            formControls: updatedControls,
            formIsValid: formIsValid,
        });
    };

    updateDevice(device, id){
        return API_DEVICES.updateDevice(device, id, (result,status, error) => {
            if (result !== null) {
                console.log("Successfully updated device with id: " + result);
                this.reloadHandler();
            } else {
                this.setState({
                    errorStatus: status,
                    error: error,
                });
            }
        })
    }

    handlePersonSelect = (event) => {
        const idRef = event.target.value;
        if (idRef === "") {
            const updatedControls = this.state.formControls;
            updatedControls.person.value = null;
            this.setState({formControls: updatedControls});
            return;
        }
        API_DEVICES.getPersonByIdRef(idRef, (person, status, err) => {
            if (person && status === 200) {
                const updatedControls = this.state.formControls;
                updatedControls.person.value = {
                    id: person.id,
                    id_ref: person.id_ref,
                };

                this.setState({formControls: updatedControls});
            } else {
                console.error("Error fetching person by id_ref:", err);
                this.setState({
                    errorStatus: status,
                    error: err,
                });
            }
        });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        let deviceData = {
            description: this.state.formControls.description.value,
            address: this.state.formControls.address.value,
            mhc: this.state.formControls.mhc.value,
            person: this.state.formControls.person.value,
        }
        console.log(deviceData);
        const id = this.props.device.id;
        this.updateDevice(deviceData, id);
    }

    render() {
        return (
            <div>
                <FormGroup id="description">
                    <Label for="description">Description: </Label>
                    <Input
                        name="description"
                        id="description"
                        placeholder={this.state.formControls.description.placeholder}
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.description.value}
                        touched={this.state.formControls.description.touched ? 1 : 0}
                        valid={this.state.formControls.description.valid}
                        required
                    />
                    {this.state.formControls.description.touched &&
                        !this.state.formControls.description.valid && (
                            <div className={"error-message row"}>
                                {" "}
                                * Name must have at least 3 characters{" "}
                            </div>
                        )}
                </FormGroup>

                <FormGroup id="address">
                    <Label for="addressField"> Address: </Label>
                    <Input
                        name="address"
                        id="addressField"
                        placeholder={this.state.formControls.address.placeholder}
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.address.value}
                        touched={this.state.formControls.address.touched ? 1 : 0}
                        valid={this.state.formControls.address.valid}
                        required
                    />
                </FormGroup>

                <FormGroup id="mhc">
                    <Label for="mhc"> MHC: </Label>
                    <Input
                        name="mhc"
                        id="mhc"
                        placeholder={this.state.formControls.mhc.placeholder}
                        min={0}
                        max={100}
                        type="number"
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.mhc.value}
                        touched={this.state.formControls.mhc.touched ? 1 : 0}
                        valid={this.state.formControls.mhc.valid}
                        required
                    />
                </FormGroup>

                <FormGroup id="person">
                    <Label for="person">Choose Person:</Label>
                    <Input
                        type="select"
                        name="personSelect"
                        id="personSelect"
                        onChange={this.handlePersonSelect}
                        value={this.state.formControls.person.value ? this.state.formControls.person.value.id_ref : ""}
                    >
                        <option value="">Choose a person</option>
                        {this.props.persons.map(person => (
                            <option key={person.id} value={person.id}>
                                {person.name}
                            </option>
                        ))}
                    </Input>
                </FormGroup>
                <Row>
                    <Col sm={{size: "4", offset: 8}}>
                        <Button
                            type={"submit"}
                            disabled={!this.state.formIsValid}
                            onClick={this.handleSubmit}
                        >
                            {" "}
                            Submit{" "}
                        </Button>
                    </Col>
                </Row>

                {this.state.errorStatus > 0 && (
                    <APIResponseErrorMessage
                        errorStatus={this.state.errorStatus}
                        error={this.state.error}
                    />
                )}
            </div>
        )
    }

}

export default UpdateForm;