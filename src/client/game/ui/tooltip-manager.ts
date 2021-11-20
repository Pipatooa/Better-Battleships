import { game } from '../game';
import type { Tile } from '../scenario/board';
import type { Ship } from '../scenario/ship';
import { VariableVisibilityElement } from './variable-visibility-element';

export let tooltipManager: TooltipManager;

export class TooltipManager {

    private highlightedLocation: [number, number] = [-Infinity, -Infinity];
    private highlightedTile: Tile | undefined;

    public highlightedShipOverride: Ship | undefined;
    public readonly placementFeedback: string | undefined;
    
    // Tooltip elements
    private readonly tooltipElement = new VariableVisibilityElement($('#game-tooltip'));
    
    private readonly tooltipTileSectionElement = new VariableVisibilityElement($('#game-tooltip-tile-section'));
    private readonly tooltipTileCoordinatesElement = $('#game-tooltip-tile-coordinates');
    private readonly tooltipTileNameElement = $('#game-tooltip-tile-name');
    private readonly tooltipTileTraversableElement = $('#game-tooltip-tile-traversable');
    
    private readonly tooltipShipSectionElement = new VariableVisibilityElement($('#game-tooltip-ship-section'));
    private readonly tooltipShipNameElement = $('#game-tooltip-ship-name');
    private readonly tooltipShipOwnerElement = $('#game-tooltip-ship-owner');

    public constructor() {
        tooltipManager = this;

        // Register event handlers
        game.gameRenderer!.viewportHandler.canvas.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
    }

    public updateTooltip(): void {

        // Tile section
        const tileSectionVisible = this.highlightedTile !== undefined;
        this.tooltipTileSectionElement.setVisibility(tileSectionVisible);
        if (tileSectionVisible) {
            this.tooltipTileCoordinatesElement.text(`${this.highlightedLocation[0]}, ${this.highlightedLocation[1]}`);
            this.tooltipTileNameElement.text(this.highlightedTile![0].descriptor.name);
            this.tooltipTileTraversableElement.text(this.highlightedTile![0].traversable ? '✓' : '✗');
        }

        // Ship section
        const ship = this.highlightedShipOverride ?? this.highlightedTile?.[2];
        const shipSectionVisible = ship !== undefined;
        this.tooltipShipSectionElement.setVisibility(shipSectionVisible);
        if (shipSectionVisible) {
            this.tooltipShipNameElement.text(ship!.descriptor.name);
            this.tooltipShipOwnerElement.text(ship!.player.name);
        }

        // Update overall tooltip visibility
        const tooltipVisible = tileSectionVisible || shipSectionVisible;
        this.tooltipElement.setVisibility(tooltipVisible);
    }

    private onPointerMove(ev: PointerEvent): void {

        // Move tooltip
        this.tooltipElement.element.get(0).style.left = `${ev.x + 5}px`;
        this.tooltipElement.element.get(0).style.top = `${ev.y + 5}px`;

        // Update highlighted tile coordinates
        const [ canvasX, canvasY ] = game.gameRenderer!.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
        const [ x, y ] = game.gameRenderer!.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, game.board!);
        this.highlightedLocation = [Math.floor(x), Math.floor(y)];
        this.highlightedTile = game.board!.tiles[Math.floor(y)]?.[Math.floor(x)];
        this.updateTooltip();
    }
}
