import {IConnectionInfoEvent} from '../../../../shared/network/events/i-connection-info';

export let identity: string;

/**
 * Handles a connection info event from the server
 * @param connectionInfo Event object to handle
 */
export function handleConnectionInfo(connectionInfo: IConnectionInfoEvent) {

    // Store identity for later use
    identity = connectionInfo.identity;
}
