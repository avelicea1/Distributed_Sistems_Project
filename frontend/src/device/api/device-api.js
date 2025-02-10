import {HOST} from "../../commons/hosts";
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    device: "/device",
    person: "/person"
};

function getToken() {
    return sessionStorage.getItem("jwtToken");
}

function getDevices(callback) {
    let request = new Request(HOST.backend_api_devices + endpoint.device, {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
        },
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postDevice(device, callback) {
    let request = new Request(HOST.backend_api_devices + endpoint.device, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + getToken(),
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(device)
    });
    console.log(request.url);

    RestApiClient.performRequest(request, callback);
}

function deleteDevice(params, callback) {
    let request = new Request(
        HOST.backend_api_devices + endpoint.device + "/" + params.id,
        {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + getToken(),
                Accept: "application/json"
            }
        }
    );
    console.log(request.url);
    RestApiClient.performRequest(request, (response, status, err) => {
        if (err) {
            console.error("Error in delete:", err);
            callback(null);
        } else if (status >= 200 && status < 300) {
            callback(status);
        } else {
            console.error("Failed delete, status:", status);
            callback(null);
        }
    });
}

function updateDevice(device, params, callback) {
    let request = new Request(HOST.backend_api_devices + endpoint.device + "/" + params, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + getToken(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(device)
    });
    console.log(request.url);
    RestApiClient.performRequest(request, (response, status, err) => {
        if (err) {
            console.error("Error in update:", err);
            callback(null);
        } else if (status >= 200 && status < 300) {
            console.log("Update Response:", response);
            callback(response);
        } else {
            console.error("Failed update, status:", status, "Response:", response);
            callback(null);
        }
    });
}

function getPersons(callback) {
    let request = new Request(HOST.backend_api + endpoint.person,
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + getToken(),
                Accept: "application/json",
            },
        });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}
function getPersonByIdRef(params, callback){
    let request = new Request(HOST.backend_api_devices + endpoint.person+ "/idRef/"+ params, {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
        },
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function getDevicesForPerson(params, callback){
    let request = new Request(HOST.backend_api_devices + endpoint.person + "/devices/"+params, {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
        },
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}
function assignPersonToDevice(personId, deviceId, callback){
    let request = new Request(HOST.backend_api_devices + endpoint.device + "/assign/" +personId + "/" + deviceId ,{
        method: 'PUT',
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
        },
    });
    console.log(request.url);
    RestApiClient.performRequest(request, (response, status, err) => {
        if (err) {
            console.error("Error in assign:", err);
            callback(null);
        } else if (status >= 200 && status < 300) {
            console.log("Assign Response:", response);
            callback(response);
        } else {
            console.error("Failed assign, status:", status, "Response:", response);
            callback(null);
        }
    });
}

export {getDevices, postDevice, deleteDevice, updateDevice, getPersons, getPersonByIdRef, getDevicesForPerson, assignPersonToDevice};
