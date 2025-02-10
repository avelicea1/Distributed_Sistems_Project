import { HOST } from "../commons/hosts";
import RestApiClient from "../commons/api/rest-client";

const endpoint = {
    fetchMessages: "/fetchMessages", // Define the endpoint to fetch messages
};

function getToken() {
    return sessionStorage.getItem("jwtToken");
}

function getMessages(senderId, receiverId, callback) {
    let request = new Request(`http://localhost/api-chat/fetchMessages?senderId=${senderId}&receiverId=${receiverId}`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
            "Content-Type": "application/json",
        },
       
        body: null, 
    });

    RestApiClient.performRequest(request, callback);
}

function getGroupMessages(callback) {
    let request = new Request("http://localhost/api-chat/fetchGroupMessages", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
            "Content-Type": "application/json",
        },
       
        body: null, 
    });

    RestApiClient.performRequest(request, callback);
}

function markMessagesAsSeen(currentUser, userId, callback){
    let request = new Request(`http://localhost/api-chat/markMessagesAsSeen?senderId=${userId}&receiverId=${currentUser}`, {
        method: "PUT", 
        headers: {
            Authorization: "Bearer " + getToken(),
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: null,
    });
    RestApiClient.performRequest(request, callback);
}

export { getMessages, getGroupMessages, markMessagesAsSeen };
