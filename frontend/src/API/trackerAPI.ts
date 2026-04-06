import {request} from './requests.ts';
import config from '../config.json';
import { sendMessage } from '../styling/components.tsx';

export interface trackerData {
    trackerId :  string
    location : string
    battery : string
    tagId : string    
}

// -- GET --
export async function getTracker(trackerId : string):Promise<any>{    
    let params = "?id=" + trackerId;
    return await request(config.endpoint.tracker + '/id' + params, 'GET')
        .then((response : any) => {
            if(response != null){
                console.log(response)
                sendMessage('success', response)
                return response;
            }
            else {
                console.log("data is null")
                return null;
            }
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);
            sendMessage('error', "Fetch Failed: " + errorMessage) 
            return null;
        });
};

// -- POST -- 
export async function postTracker(data : trackerData):Promise<any>{
    let trackerId = data.trackerId
    let location = data.location
    let battery = data.battery
    let tagId = data.tagId

    return await request(config.endpoint.tracker +'/register', 'POST', { trackerId, location, battery, tagId })
        .then((response) => {
            console.log("response", response)
            sendMessage('success', "Tracker Registration Successful")
            return response;
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);            
            return null;
        });
};

// Only used by Monitoring service ??
// Temporary
export async function updateTracker(data : trackerData):Promise<any>{
    let trackerId = data.trackerId
    let location = data.location
    let battery = data.battery

    return await request(config.endpoint.tracker +'/update', 'POST', { trackerId, location, battery })
        .then((response) => {
            console.log("response", response)
            sendMessage('success', "Tracker Update Successful")
            return response;
        })
        .catch((errorMessage) => {
            console.log("error", errorMessage);            
            sendMessage('error', "Update Failed:" + errorMessage)
            return null;
        });
};