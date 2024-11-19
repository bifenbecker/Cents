/**
 * This file provides few helpers methods on the Socket prototype 
 * These methods aim to help in managing the socket connection efficiently
 *  
 * @author Vinod Krishna Vellampalli
 */

import { Socket } from 'socket.io-client';


/**
 * Method to check if there are any active listerners on the 
 * custom events defined during initialization of socket
 *
 * @returns boolean
 */
function hasAnyActiveListeners(){
    let hasAnyActiveListeners = false;
    if( this.customEvents && Object.keys(this.customEvents).length > 0 ){
        for (let i = 0; i < Object.keys(this.customEvents).length; i++) {
            if(this.hasListeners(this.customEvents[Object.keys(this.customEvents)[i]])){
                hasAnyActiveListeners = true;
                break;
            }
        }
    }
    return hasAnyActiveListeners;
}


/**
 * This method closes the socket connection if there are 
 * no active listerners on the custom events.
 * 
 * It can be used to avoid unnecessary network load
 * It can be used in componentWillUnmount after removing all listeners
 */
function disconnectSafely(){
    if(this.connected && !this.hasAnyActiveListeners()){
        this.disconnect();
    }
    else if(this.hasAnyActiveListeners()){
        console.warn(`Failed to disconnect safely
        There are active listeners on one or more events
        This might be an indication of memory leak
        Please check your code for any event handlers which are not removed
        `);
    }
}


/**
 * Method to register custom event handlers
 * It sets the handler only if the event is listed during socket initialization
 * else throws an error
 * 
 * If custom events it self is undefined or null on the socket then it sets the event handlers
 *
 * @param {string} event
 * @param {function} handler
 */
function onCustomEvent(event, handler){
    if(this.customEvents){
        if(Object.values(this.customEvents).includes(event))
        {
            Socket.prototype.on.call(this, event, handler);
        }
        else{
            throw new Error("Invalid event passed,\nOnly events listed while calling initSocket are considered valid.");
        } 
    }
    else{
        Socket.prototype.on.call(this, event, handler);
    }
}

Socket.prototype.onCustomEvent = onCustomEvent;
Socket.prototype.hasAnyActiveListeners = hasAnyActiveListeners;
Socket.prototype.disconnectSafely = disconnectSafely;