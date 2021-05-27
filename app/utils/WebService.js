// import { Constants } from "../consts/Constants";
import * as Global from "../Global/Global";

export default class WebService {

    static callServiceGet = (URL, callBackFunction) => {
        var header = {
            'Authorization': 'Bearer ' + Global.API_TOKEN,
        }

        fetch(URL, {
            method: "GET",
            headers: header
        })
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            callBackFunction(responseData, responseData.isError);
        })
        .catch(error => {
            console.log("URL:" + URL + ":55555555555555:" + error.message);
            
            callBackFunction(error, true);
            // if (error.message == Constants.ERROR_COMETCHAT_LOGOUT) {
            //     callBackFunction(Constants.ERROR_MESSAGE_COMETCHAT_LOGOUT, true);
            // } else if (error.message == Constants.ERROR_NETWORK_REQUEST_FAILED) {
            //     callBackFunction(Constants.NO_INTERNET, true);
            // } else if (typeof error == String(undefined) ) {
            //     callBackFunction("", true);
            // } else {
            //     callBackFunction(error, true);
            // }
        });
    };

    static callServiceDelete = (URL, callBackFunction) => {
        var header = {
            'Authorization': 'Bearer ' + Global.API_TOKEN,
        }

        fetch(URL, {
            method: "DELETE",
            headers: header
        })
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            callBackFunction(responseData, responseData.isError);
        })
        .catch(error => {
            console.log("URL:" + URL + ":55555555555555:" + error.message);
            
            callBackFunction(error, true);
            // if (error.message == Constants.ERROR_COMETCHAT_LOGOUT) {
            //     callBackFunction(Constants.ERROR_MESSAGE_COMETCHAT_LOGOUT, true);
            // } else if (error.message == Constants.ERROR_NETWORK_REQUEST_FAILED) {
            //     callBackFunction(Constants.NO_INTERNET, true);
            // } else if (typeof error == String(undefined) ) {
            //     callBackFunction("", true);
            // } else {
            //     callBackFunction(error, true);
            // }
        });
    };

    static callServicePut = (URL, apiBody, callBackFunction) => {
        var header = {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + Global.API_TOKEN,
        }

        fetch(URL, {
            method: "PUT",
            body: apiBody,
            headers: header
        })
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            callBackFunction(responseData, responseData.isError);
        })
        .catch(error => {
            console.log("URL:" + URL + ":55555555555555:" + error.message);
            
            callBackFunction(error, true);
            // if (error.message == Constants.ERROR_COMETCHAT_LOGOUT) {
            //     callBackFunction(Constants.ERROR_MESSAGE_COMETCHAT_LOGOUT, true);
            // } else if (error.message == Constants.ERROR_NETWORK_REQUEST_FAILED) {
            //     callBackFunction(Constants.NO_INTERNET, true);
            // } else if (typeof error == String(undefined) ) {
            //     callBackFunction("", true);
            // } else {
            //     callBackFunction(error, true);
            // }
        });
    };

    static callServicePost = (URL, apiBody, callBackFunction) => {
        
        var header = {
            'Content-Type': 'application/json',
            // 'X-Requested-With': 'XMLHttpRequest',
            'Authorization': 'Bearer ' + Global.API_TOKEN,
        }
        
        fetch(URL, {
            method: "POST",
            body: apiBody,
            headers: header
        })
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            // console.log('responseData>>', responseData);
            callBackFunction(responseData, responseData.isError);
        })
        .catch(error => {
            console.log("URL:" + URL + ":1222222244444444:" + error);
            callBackFunction(error, true);
            // if (error.message == Constants.ERROR_COMETCHAT_LOGOUT) {
            //     callBackFunction(Constants.ERROR_MESSAGE_COMETCHAT_LOGOUT, true);
            // } else if (error.message == Constants.ERROR_NETWORK_REQUEST_FAILED) {
            //     callBackFunction(Constants.NO_INTERNET, true);
            // } else if (typeof error == String(undefined) ) {
            //     callBackFunction("", true);
            // } else {
            //     callBackFunction(error, true);
            // }
        });
    };

}
