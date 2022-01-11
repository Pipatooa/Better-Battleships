import { baseEventInfo } from '../../events/base-events';

/**
 * Record describing all tile events
 */
export const tileEventInfo = {
    ...baseEventInfo,
    onShipEnterTile: [['team', 'player', 'ship'], [], ['tile'], []],
    onShipLeaveTile: [['team', 'player', 'ship'], [], ['tile'], []],
    onShipMoveOverTile: [['team', 'player', 'ship'], [], ['tile'], []]
} as const;

/**
 * Type matching record describing all tile events
 */
export type TileEventInfo = typeof tileEventInfo;

/**
 * Type matching all tile event name string
 */
export type TileEvent = keyof TileEventInfo;

/**
 * Record describing all region events
 */
export const regionEventInfo = {
    ...baseEventInfo,
    onShipEnterRegion: [['team', 'player', 'ship'], [], ['region'], ['region']],
    onShipLeaveRegion: [['team', 'player', 'ship'], [], ['region'], ['region']],
    onShipMoveWithinRegion: [['team', 'player', 'ship'], [], ['region'], ['region']]
} as const;

/**
 * Type matching record describing all region events
 */
export type RegionEventInfo = typeof regionEventInfo;

/**
 * Type matching all tile event region string
 */
export type RegionEvent = keyof RegionEventInfo;

/**
 * Record describing all board events
 */
export const boardEventInfo = {
    ...tileEventInfo,
    ...regionEventInfo
} as const;

/**
 * Type matching record describing all region events
 */
export type BoardEventInfo = typeof boardEventInfo;

/**
 * Type matching all tile event region string
 */
export type BoardEvent = keyof BoardEventInfo;
