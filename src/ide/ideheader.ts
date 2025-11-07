import $ from "jquery";
import IDE from "./ide";

export default class IDEHeader {
    html: JQuery<HTMLElement>;
    /**
     * Constructs the footer of the IDE element.
     */
    constructor(public ide: IDE) {
        this.html = $(`<div class="ide-header">
        <div class="btn-toolbar" role="toolbar">
            <div class="btn-group appname">
                <label>Dynamic Case Management</label>
            </div>
        </div>
    </div>`);
        this.ide.html.append(this.html);
    }
}
