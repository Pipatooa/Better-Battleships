import { IConnectionInfoEvent } from '../../../../shared/network/events/i-connection-info';

export let selfIdentity: string;

/**
 * Handles a connection info event from the server
 *
 * @param  connectionInfo Event object to handle
 */
export function handleConnectionInfo(connectionInfo: IConnectionInfoEvent): void {

    // Store identity for later use
    selfIdentity = connectionInfo.identity;
}
