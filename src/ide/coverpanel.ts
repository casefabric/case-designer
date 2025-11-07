import "@styles/ide/coverpanel.css";
import $ from "jquery";
import IDEMain from "./idemain";

/**
 * Showing/hiding status messages on top of the fixed editors.
 */
export default class CoverPanel {
    html: JQuery<HTMLElement>;
    msgElement: JQuery<HTMLElement>;
    visible: boolean = false;

    /**
     * This editor handles Case models
     */
    constructor(public ide: IDEMain, private parent: JQuery<HTMLElement>, mainClass = '') {
        this.ide = ide;
        this.html = $(`<div class="divCoverPanel ${mainClass}">
    <div class="basicbox message">
        <label class="labelCoverPanelDescription">Please, open or create a model.</label>
    </div>
</div>`);
        this.parent.append(this.html);
        this.msgElement = this.html.find('.labelCoverPanelDescription');
    }

    /**
     * Show a message on the cover panel and make it visible
     */
    show(msg: string) {
        this.msgElement.html(msg);
        this.html.show();
    }

    hide() {
        this.html.hide();
    }
}
