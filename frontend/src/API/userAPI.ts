import {request} from './requests.ts';
import config from '../config.json';
import { sendMessage } from '../styling/components.tsx';
import {User} from './interfaces.ts';

export interface userInfo {
    name : string,
    id : string, 
    password : string
    role : string
    email : string
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
            sendMessage('error', "Login Failed:" + errorMessage) 
        });
    return loggedInAs
};


export async function getUsersByRole(qRole : string):Promise<User[]>{   
    let users : User[] = [] 
    let params = "?role=" + qRole;
    await request(config.endpoint.user + '/getUsersByRole'+ params, 'GET')
        .then((response : any) => {
            if(response != null){
                console.log(response)
                // sendMessage('success', "Login Successful")
                users = response.users
                // localStorage.setItem("jwt", JSON.stringify(response["token"]))
                // loggedInAs =  JSON.stringify(response.user.role)
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
            sendMessage('error', "Users Fetch Failed:" + errorMessage) 
        });
        return users
};

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

// -- DELETE --
export async function deleteUser(data: userInfo): Promise<boolean> {
    let isDeleted = false;
    let id = data.id;
    let password = data.password;

    await request(config.endpoint.user + '/deleteUser', 'POST', { id, password })
        .then((response) => {
            // handle successful delete
            console.log("response", response)
            sendMessage('success', "User Deleted")
            isDeleted = true
        })
        .catch((errorMessage) => {
            // handle login error
            console.log("error", errorMessage);            
            sendMessage('error', "Deletion failed" + errorMessage)
        });
  
    return isDeleted
};

// make Admin
export async function makeAdmin(data: userInfo): Promise<boolean> {
    let isAdmin = false;
    let id = data.id;
    let password = data.password;

    await request(config.endpoint.user + '/makeAdmin', 'POST', { id, password })
        .then((response) => {
            // handle successful makeadmin
            console.log("response", response)
            sendMessage('success', "User made Admin")
            isAdmin = true
        })
        .catch((errorMessage) => {
            // handle login error
            console.log("error", errorMessage);            
            sendMessage('error', "Deletion failed" + errorMessage)
        });
  
    return isAdmin
};
