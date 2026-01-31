import {request} from './requests.ts'
import config from '../config.json';
import { NavigateFunction } from "react-router-dom";
import { sendMessage } from '../styling/components.tsx';

export interface trackerData {
    trackerId :  string
    location : string
    battery : string
    tagId : string    
}

// -- GET --
export async function getTracker(trackerId : string):Promise<any>{    

    await request(config.endpoint.tracker + '/' + trackerId, 'GET')
        .then((response : any) => {
            if(response != null){
                console.log(response)
                sendMessage('success', response)
            }
            else {
                console.log("data is null")
            }
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);
            sendMessage('error', "Login  Failed:" + errorMessage) 
        });
};

export async function getTrackersByUser(userId :string):Promise<any>{    

    await request(config.endpoint.tracker + '/' + userId, 'GET')
        .then((response : any) => {
            if(response != null){
                console.log(response)
                sendMessage('success', response)
            }
            else {
                console.log("data is null")
            }
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);
            sendMessage('error', "Login  Failed:" + errorMessage) 
        });
};

// -- POST -- 

export async function postTracker(data : trackerData):Promise<any>{
    let trackerId = data.trackerId
    let location = data.location
    let battery = data.battery
    let tagId = data.tagId

    await request(config.endpoint.tracker +'/register', 'POST', { trackerId, location, battery, tagId })
        .then((response) => {
            console.log("response", response)
            sendMessage('success', "Tracker Registration Successful")
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);            
            sendMessage('error', "Registration  Failed:" + errorMessage)
        });
};

// Only used by Monitoring service ??
// Temporary
export async function updateTracker(data : trackerData):Promise<any>{
    let trackerId = data.trackerId
    let location = data.location
    let battery = data.battery

    await request(config.endpoint.user +'/update', 'POST', { trackerId, location, battery })
        .then((response) => {
            console.log("response", response)
            sendMessage('success', "Tracker Registration Successful")
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);            
            sendMessage('error', "Registration  Failed:" + errorMessage)
        });
};