import {IConnectionInfoEvent} from '../../../../shared/network/events/i-connection-info';

export let identity: string;

export function handleConnectionInfo(connectionInfo: IConnectionInfoEvent) {
    identity = connectionInfo.identity;
}
