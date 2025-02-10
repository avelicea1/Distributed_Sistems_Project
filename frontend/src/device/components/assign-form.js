import React from "react";
import * as API_DEVICES from "../api/device-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";
import { Button, FormGroup, Input, Label } from "reactstrap";

class AssignForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPerson: null,
            errorStatus: 0,
            error: null,
        };
    }

    handleChange = (event) => {
        this.setState({ selectedPerson: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const { selectedPerson } = this.state;
        const { deviceId, reloadHandler } = this.props;

        if (selectedPerson) {
            API_DEVICES.assignPersonToDevice(selectedPerson, deviceId, (response) => {
                if (response) {
                    reloadHandler();
                    this.props.toggle();
                } else {
                    this.setState({
                        errorStatus: response.status,
                        error: response.error,
                    });
                }
            });
        }
    };

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <Label for="personSelect">Select Person</Label>
                    <Input
                        type="select"
                        id="personSelect"
                        value={this.state.selectedPerson || ""}
                        onChange={this.handleChange}
                        required
                    >
                        <option value="" disabled>Select a person</option>
                        {this.props.persons.map((person) => (
                            <option key={person.id} value={person.id}>
                                {person.name}
                            </option>
                        ))}
                    </Input>
                </FormGroup>
                {this.state.errorStatus > 0 && (
                    <APIResponseErrorMessage
                        errorStatus={this.state.errorStatus}
                        error={this.state.error}
                    />
                )}
                <Button type="submit" color="primary">Assign</Button>
            </form>
        );
    }
}

export default AssignForm;
