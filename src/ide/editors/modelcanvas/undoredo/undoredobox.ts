import $ from "jquery";
import Images from "../../../util/images/images";
import UndoManager from "./undomanager";

export default class UndoRedoBox {
    private spanUndoCounter: JQuery<HTMLElement>;
    private spanRedoCounter: JQuery<HTMLElement>;

    constructor(public undoManager: UndoManager, public html: JQuery<HTMLElement>) {
        this.html.append(
            $(`<div class="formheader">
    <div>
        <div class="undo" type="button" title="Undo">
            <span>${this.undoManager.getUndoCount()}</span>
            <img src="${Images.Undo}" />
        </div>                
        <div class="redo" type="button" title="Redo">
            <img src="${Images.Redo}" />
            <span>${this.undoManager.getRedoCount()}</span>
        </div>
    </div>
</div>`)
        );
        html.find('.undo').on('click', () => this.undoManager.undo());
        html.find('.redo').on('click', () => this.undoManager.redo());
        this.spanUndoCounter = html.find('.undo span');
        this.spanRedoCounter = html.find('.redo span');
    }

    refresh(): void {
        this.spanUndoCounter.html(`${this.undoManager.getUndoCount()}`);
        this.spanRedoCounter.html(`${this.undoManager.getRedoCount()}`);
    }
}
