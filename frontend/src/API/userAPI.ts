import {request} from './requests.ts'
import config from '../config.json';
import { NavigateFunction } from "react-router-dom";
import { sendMessage, Product, CreditCard } from '../styling/components.tsx';

export interface userData {
    email : string, 
    role : string,
    name : string, 
    password : string
}
export async function postUser(data : userData):Promise<boolean>{
    let email = data.email
    let name = data.name
    let password  = data.password
    let role = data.role
    let isRegistered = false
    await request(config.endpoint.user +'/register', 'POST', { name, role, email, password })
        .then((response) => {
            // handle successful login
            console.log("response", response)
            sendMessage('success', "Register Successful")
            isRegistered = true
        })
        .catch((errorMessage) => {
            // handle login error
            console.log("error", errorMessage);            
            sendMessage('error', "Registration  Failed:" + errorMessage)
        });
    return isRegistered
};
