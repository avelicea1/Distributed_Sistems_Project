import {HOST} from "../../commons/hosts";
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    person: "/person",
};

function getToken() {
    return sessionStorage.getItem("jwtToken");
}

function getPersons(callback) {
    let request = new Request(HOST.backend_api + endpoint.person, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
        },
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function getPersonById(params, callback) {
    let request = new Request(HOST.backend_api + endpoint.person + params.id, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
        },
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postPerson(user, callback) {
    let request = new Request(HOST.backend_api + endpoint.person, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + getToken(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(user),
    });

    console.log("URL: " + request.url);

    RestApiClient.performRequest(request, callback);
}

function deletePerson(params, callback) {
    let request = new Request(
        HOST.backend_api + endpoint.person + "/" + params.id,
        {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + getToken(),
                Accept: "application/json",
            },
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

function updatePerson(user, params, callback) {
    let request = new Request(HOST.backend_api + endpoint.person + "/" + params, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + getToken(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(user),
    });
    console.log("Request URL: ", request.url);
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

export {getPersons, getPersonById, postPerson, deletePerson, updatePerson};
