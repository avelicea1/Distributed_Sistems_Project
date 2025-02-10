import { HOST } from "../../commons/hosts";
import RestApiClient from "../../commons/api/rest-client";
import {jwtDecode} from "jwt-decode";

const endpoint = {
  login: "/auth/login",
  register: "/auth/register",
};

function login(email, password, callback) {
  let request = new Request(HOST.backend_api + endpoint.login, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  RestApiClient.performRequest(request, (data, status, err) => {
    if (status === 1) {
      console.error("An unexpected error occurred:", err);
      callback(null);
    } else if (status >= 200 && status < 300) {
      console.log("Login successful, data:", data);
      if (data.jwt) {
        console.log(data.jwt)
        const token = data.jwt;
        sessionStorage.setItem("jwtToken", token);
        const decodedData = jwtDecode(token);
        console.log("decodedData", decodedData);
        sessionStorage.setItem("id", decodedData.id);
        sessionStorage.setItem("role", decodedData.role);
        sessionStorage.setItem("userEmail", email);
        callback(data);
      } else {
        console.error("JWT token is missing from the response");
        callback(null);
      }
    } else {
      console.error("Login request failed, status:", status, "Error:", err);
      callback(null);
    }
  });
}

function register(person, callback) {
  let request = new Request(HOST.backend_api + endpoint.register, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-type": "application/json",
    },
    body: JSON.stringify(person),
    credentials: "include"
  });

  RestApiClient.performRequest(request, (data, status, err) => {
    if (status === 1) {
      console.error("An unexpected error occurred:", err);
      callback(null);
    } else if (status >= 200 && status < 300) {
      console.log("Registration successful", data);
      callback(data);
    } else {
      callback(null);
    }
  });
}

export { login, register };
