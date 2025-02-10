import React from "react";
import validate from "./validators/person-validators";
import Button from "react-bootstrap/Button";
import * as API_USERS from "../api/person-api";
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
                name: {
                    value: this.props.person.name,
                    placeholder: "What is your name?...",
                    valid: true,
                    touched: false,
                    validationRules: {
                        minLength: 3,
                        isRequired: true,
                    },
                },
                email: {
                    value: this.props.person.email,
                    placeholder: "Email...",
                    valid: true,
                    touched: false,
                    validationRules: {
                        emailValidator: true,
                    },
                },
                age: {
                    value: this.props.person.age,
                    placeholder: "Age...",
                    valid: true,
                    touched: false,
                },
                address: {
                    value: this.props.person.address,
                    placeholder: "Cluj, Zorilor, Str. Lalelelor 21...",
                    valid: true,
                    touched: false,
                },
                role: {
                    value: this.props.person.role,
                    placeholder: "ADMIN/USER...",
                    valid: true,
                    touched: false,
                },
                password: {
                    value: "",
                    placeholder: "Password...",
                    valid: true,
                    touched: false,
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

    updatePerson(person, id) {
        return API_USERS.updatePerson(person, id, (result, status, error) => {
            if (result !== null) {
                console.log("Successfully updated person with id: " + result);
                this.reloadHandler();
            } else {
                this.setState({
                    errorStatus: status,
                    error: error,
                });
            }
        });
    }

    handleSubmit() {
        let person = {
            name: this.state.formControls.name.value,
            email: this.state.formControls.email.value,
            age: this.state.formControls.age.value,
            address: this.state.formControls.address.value,
            role: this.state.formControls.role.value,
            password: this.state.formControls.password.value,
        };
        const id = this.props.person.id;

        console.log(person);
        this.updatePerson(person, id);
    }

    render() {
        return (
            <div>
                <FormGroup id="name">
                    <Label for="nameField"> Name: </Label>
                    <Input
                        name="name"
                        id="nameField"
                        placeholder={this.state.formControls.name.placeholder}
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.name.value}
                        touched={this.state.formControls.name.touched ? 1 : 0}
                        valid={this.state.formControls.name.valid}
                        required
                    />
                    {this.state.formControls.name.touched &&
                        !this.state.formControls.name.valid && (
                            <div className={"error-message row"}>
                                {" "}
                                * Name must have at least 3 characters{" "}
                            </div>
                        )}
                </FormGroup>

                <FormGroup id="email">
                    <Label for="emailField"> Email: </Label>
                    <Input
                        name="email"
                        id="emailField"
                        placeholder={this.state.formControls.email.placeholder}
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.email.value}
                        touched={this.state.formControls.email.touched ? 1 : 0}
                        valid={this.state.formControls.email.valid}
                        required
                    />
                    {this.state.formControls.email.touched &&
                        !this.state.formControls.email.valid && (
                            <div className={"error-message"}>
                                {" "}
                                * Email must have a valid format
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

                <FormGroup id="age">
                    <Label for="ageField"> Age: </Label>
                    <Input
                        name="age"
                        id="ageField"
                        placeholder={this.state.formControls.age.placeholder}
                        min={0}
                        max={100}
                        type="number"
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.age.value}
                        touched={this.state.formControls.age.touched ? 1 : 0}
                        valid={this.state.formControls.age.valid}
                        required
                    />
                </FormGroup>

                <FormGroup id="role">
                    <Label for="roleField"> Role: </Label>
                    <Input
                        type="select"
                        name="role"
                        id="roleField"
                        value={this.state.formControls.role.value}
                        onChange={this.handleChange}
                        touched={this.state.formControls.role.touched ? 1 : 0}
                        valid={this.state.formControls.role.valid}
                        required
                    >
                        <option value="ADMIN">ADMIN</option>
                        <option value="CLIENT">CLIENT</option>
                    </Input>
                </FormGroup>
                <FormGroup id="password">
                    <Label for="passwordField"> Password: </Label>
                    <Input
                        type="password"
                        name="password"
                        id="passwordField"
                        placeholder={this.state.formControls.password.placeholder}
                        onChange={this.handleChange}
                        defaultValue={this.state.formControls.password.value}
                        touched={this.state.formControls.password.touched ? 1 : 0}
                        valid={this.state.formControls.password.valid}
                        required
                    />
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
        );
    }
}

export default UpdateForm;
