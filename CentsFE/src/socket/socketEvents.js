/**
 * This file contains the list of all events
 * that can be emitted on socket and the list of 
 * events that can be listened for on the socket
 */
const socketEventConstants = {

    // List of events to listen on
    listenerEvents: {
        MACHINE_STATUS_UPDATED: 'MACHINE_STATUS_UPDATED',
        MACHINE_RUNNING_STATUS_UPDATED: "MACHINE_RUNNING_STATUS_UPDATED",
    },

    // List of events that can be emitted
    emitterEvents: {
    }
}

export default socketEventConstants;