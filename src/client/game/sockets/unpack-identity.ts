/**
 * Returns a client's name from their identity string
 * @param identity Identity string
 * @returns name -- Display name to use
 */
export function nameFromIdentity(identity: string): string {
    let match = /.+?:(.+)/.exec(identity);
    return (match as RegExpMatchArray)[1];
}