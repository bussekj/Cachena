import {request} from './requests.ts'
import config from '../config.json';
import { sendMessage } from '../styling/components.tsx';

export interface TUOData {
    name : string
    description : string
    is_locked : boolean
}

// -- GET --
export async function getTUO(TUOId : string):Promise<any>{    
    let params = "?id=" + TUOId;
    await request(config.endpoint.trackedUserObject + '/id/' + params, 'GET')
        .then((response : any) => {
            if(response != null){
                console.log(response)
                sendMessage('success', "Got Object")
            }
            else {
                console.log("data is null")
            }
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);
            sendMessage('error', "Fetch Failed:" + errorMessage) 
        });
};

export async function getTUOsByUser(userId :string):Promise<any>{    
    let params = "?userId=" + userId;
    await request(config.endpoint.trackedUserObject + '/user' + params, 'GET')
        .then((response : any) => {
            if(response != null){
                console.log(response)
                sendMessage('success', "Fetch Succesful")
            }
            else {
                console.log("data is null")
            }
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);
            sendMessage('error', "Fetch Failed:" + errorMessage) 
        });
};

// -- POST -- 
export async function postTUO(data : TUOData):Promise<any>{
    let name = data.name
    let description = data.description

    await request(config.endpoint.trackedUserObject + '/register', 'POST', { name, description })
        .then((response) => {
            console.log("response", response)
            sendMessage('success', "Tracker Registration Successful")
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);            
            sendMessage('error', "Tracker Registration Failed:" + errorMessage)
        });
};

export async function assignTUO(TUOId:string, userId:string):Promise<any>{

    await request(config.endpoint.trackedUserObject + '/assign', 'POST', { TUOId, userId })
        .then((response) => {
            console.log("response", response)
            sendMessage('success', "Tracker Assignment Successful")
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);            
            sendMessage('error', "Tracker Assignment Failed:" + errorMessage)
        });
};