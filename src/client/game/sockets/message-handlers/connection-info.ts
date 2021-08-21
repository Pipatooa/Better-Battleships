export let identity: string;

export function handleConnectionInfo(connectionInfo: IConnectionInfo) {
    identity = connectionInfo.identity;
}

export interface IConnectionInfo {
    dataType: 'connectionInfo',
    identity: string
}