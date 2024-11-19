import io from 'socket.io-client';
import { SOCKET_BASE_URL } from '../utils/config';
import './socketHelpers';
import socketEvents from './socketEvents';

let socket;
// List of all the custom events to which event handlers will be attached
export const socketListenerEvents = socketEvents.listenerEvents;
export const socketEmitterEvents = socketEvents.emitterEvents;
/**
 * Function to obtain an instance of socket object
 *
 * @returns socket
 */
const getSocket = () => {
    if(!socket){
        socket = initSocket();
    }
    
    if(socket.disconnected){
        socket.open();
    }

    return socket;
}

/**
 * Function to initialize a new socket connection
 * @param customEvents - Object with all the events to be handled on the socket object. This will be used in safe disconnetion of socket.
 * @returns socket
 */
const initSocket = (customEvents) => {
    // Create a new socket connection
    let socket = io(SOCKET_BASE_URL || "https://cents-poc.herokuapp.com/ui",
    {
        query: {
            token: localStorage.getItem('token')
        },
        autoConnect: false
    });

    if(customEvents){
        socket.customEvents = customEvents;
    }

    console.log("Socket Initialized");
    return socket;
}


// Initializing socket
socket = initSocket(socketListenerEvents);


// Handlers for in built socket connection events
socket.on('connect', () => {
    console.log("Socket connection established");
    socket.emit('open');
})

socket.on('disconnect', () => {
    console.log("Socket connection terminated");
})

socket.on('connect_error', (error) => {
     console.error("Error establishing socket connection");
});

socket.on('error', (error) => {
    console.error("Socket Error : ", error);
    // TODO: Handle authentication error
});

export default getSocket;