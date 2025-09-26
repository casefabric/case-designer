import $ from "jquery";
import TemporaryConnector from "../connector/temporaryconnector";
import Halo from "./halo";
import HaloBar from "./halobar";
import HaloItem from "./haloitem";

export default abstract class HaloDragItem<HaloT extends Halo = Halo> extends HaloItem<HaloT> {
    dragImage: JQuery<HTMLElement>;
    tempConnector!: TemporaryConnector;
    mouseMoveHandler!: (e: JQuery.TriggeredEvent) => void;
    mouseUpHandler!: (e: JQuery.TriggeredEvent) => void;
    keyDownHandler!: (e: JQuery.KeyDownEvent) => void;

    constructor(halo: HaloT, imgURL: string, title: string, defaultBar: HaloBar = halo.topBar) {
        super(halo, imgURL, title, defaultBar);
        this.dragImage = halo.element.canvas.html.find('.halodragimgid');
        this.html.on('pointerdown', (e: JQuery.TriggeredEvent) => this.handleMouseDown(e));
    }

    /** 
     * Handles mousedown in a halo image (the images to drag e.g connector from element),
     * depending on the halo type a different action is required
     */
    handleMouseDown(e: JQuery.TriggeredEvent) {
        e.preventDefault();

        // Start listening to mouse move and mouseup
        this.mouseMoveHandler = (evt: JQuery.TriggeredEvent) => this.handleMouseMove(evt);
        this.mouseUpHandler = (evt: JQuery.TriggeredEvent) => this.handleMouseUp(evt);
        this.keyDownHandler = (evt: JQuery.KeyDownEvent) => this.handleKeyDown(evt);

        // Off the handlers to avoid repeated addition
        $(document).off('pointermove', this.mouseMoveHandler);
        $(document).off('pointerup', this.mouseUpHandler);
        $(document).off('keydown', this.keyDownHandler);

        $(document).on('pointermove', this.mouseMoveHandler);
        $(document).on('pointerup', this.mouseUpHandler);
        $(document).on('keydown', this.keyDownHandler);

        // Hide current properties view
        this.halo.element.propertiesView.hide();

        // Create a temporary connector to the current coordinates
        this.tempConnector = new TemporaryConnector(this.halo.element, this.getCoordinates(e));

        this.dragImage.attr('src', this.imgURL);
        this.dragImage.css('display', 'block');
        this.positionDragImage(e);
    }

    getCoordinates(e: JQuery.TriggeredEvent) {
        return this.halo.element.canvas.getCursorCoordinates(e);
    }

    handleKeyDown(e: JQuery.KeyDownEvent) {
        if (e.keyCode == 27) { // Esc key
            e.stopPropagation();
            e.preventDefault();
            this.clear();
        }
    }

    clear() {
        $(document).off('pointermove', this.mouseMoveHandler);
        $(document).off('pointerup', this.mouseUpHandler);
        $(document).off('keydown', this.keyDownHandler);
        // Remove the temp connector
        if (this.tempConnector) {
            this.tempConnector.remove();
        }
        this.dragImage.css('display', 'none');
    }

    /** 
     * Handles mousemove after halo mousedown
     */
    handleMouseMove(e: JQuery.TriggeredEvent) {
        // Move the temporary connector to current coordinates
        if (this.tempConnector) {
            this.tempConnector.target = this.getCoordinates(e);
        }
        this.positionDragImage(e);
    }

    /**
     * positions the halo drag image next to the cursor
     */
    positionDragImage(e: JQuery.TriggeredEvent) {
        const coordinates = this.getCoordinates(e);
        const x = coordinates.x;
        const y = coordinates.y;
        const w = this.dragImage.innerWidth() || 0;
        const h = this.dragImage.innerHeight() || 0;
        this.dragImage.css('top', y - h / 2);
        this.dragImage.css('left', x - w / 2);
    }


    /**
     * Handles mouseup after mousedown on halo
     */
    handleMouseUp(e: JQuery.TriggeredEvent) {
        e.stopPropagation();
        e.preventDefault();
        this.clear(); // Clean up our content.
    }
}
