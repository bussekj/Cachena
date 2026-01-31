import {request} from './requests.ts'
import config from '../config.json';
import { NavigateFunction } from "react-router-dom";
import { sendMessage } from '../styling/components.tsx';

export interface userInfo {
    name : string, 
    password : string
}

export interface userData {
    email : string, 
    role : string,
    name : string, 
    password : string
}

// -- GET --
export async function getUser(data : userInfo):Promise<string>{    
    let name = data.name
    let password  = data.password
    let loggedInAs = ""
    await request(config.endpoint.user + '/getUser', 'POST', { name, password })
        .then((response : any) => {
            if(response != null){
                console.log(response)
                sendMessage('success', "Login Successful")
                // localStorage.setItem("jwt", JSON.stringify(response["token"]))
                loggedInAs =  JSON.stringify(response.user.role)
                // window.sessionStorage.setItem("id", JSON.stringify(response.user.id))
                // if(response["adminToken"]) {
                //     localStorage.setItem("adminToken", JSON.stringify(response["adminToken"]))
                // }
            }
            else {
                console.log("data is null")
            }
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);
            sendMessage('error', "Login  Failed:" + errorMessage) 
        });
    return loggedInAs
};

// -- GET --
// export async function getUsersByTracker(data : userInfo):Promise<string>{    
//     let name = data.name
//     let password  = data.password
//     let loggedInAs = ""
//     await request(config.endpoint.user + '/getUser', 'POST', { name, password })
//         .then((response : any) => {
//             if(response != null){
//                 console.log(response)
//                 sendMessage('success', "Login Successful")
//                 // localStorage.setItem("jwt", JSON.stringify(response["token"]))
//                 loggedInAs =  JSON.stringify(response.user.role)
//                 // window.sessionStorage.setItem("id", JSON.stringify(response.user.id))
//                 // if(response["adminToken"]) {
//                 //     localStorage.setItem("adminToken", JSON.stringify(response["adminToken"]))
//                 // }
//             }
//             else {
//                 console.log("data is null")
//             }
//         })
//         .catch((errorMessage) => {
//             console.log("error", errorMessage);
//             sendMessage('error', "Login  Failed:" + errorMessage) 
//         });
//     return loggedInAs
// };


// -- POST --
export async function postUser(data : userData):Promise<boolean>{
    let email = data.email
    let name = data.name
    let password  = data.password
    let role = data.role
    let isRegistered = false
    await request(config.endpoint.user +'/postUser', 'POST', { name, role, email, password })
        .then((response) => {
            // handle successful login
            console.log("response", response)
            sendMessage('success', "Registration Successful")
            isRegistered = true
        })
        .catch((errorMessage) => {
            // handle login error
            console.log("error", errorMessage);            
            sendMessage('error', "Registration  Failed:" + errorMessage)
        });
    return isRegistered
};