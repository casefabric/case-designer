import $ from "jquery";
import Dialog from "./editors/dialog";
import IDE from "./ide";

type NewModelResult = {
    name: string,
    description: string
}

export default class CreateNewModelDialog extends Dialog {
    constructor(ide: IDE, label: string) {
        super(ide, label);
    }

    renderDialog(dialogHTML: JQuery<HTMLElement>) {
        const htmlDialog = $(`
            <form class="model-selector dialog-content">
                <div class="dialog-content">
                    <div class="propertyBlock">
                        <label style="width:150px">Name</label><input class = "inputName" value="">
                    </div>
                    <div class="propertyBlock">
                        <label style="width:150px">Description</label><input class = "inputDescription"/>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <input style="background-color:steelblue; color:#fff" type="submit" class='buttonOk' value="OK"/>
                    <button class='buttonCancel'>Cancel</button>
                </div>
            </form>
        `);
        dialogHTML.append(htmlDialog);
        dialogHTML.find('input').on('focus', e => e.target.select());
        dialogHTML.find('.buttonOk').on('click', e => this.closeModalDialog(this.readResult(dialogHTML)));
        dialogHTML.find('.buttonCancel').on('click', e => this.closeModalDialog(false));
    }

    readResult(dialogHTML: JQuery<HTMLElement>): NewModelResult {
        const name: string = '' + dialogHTML.find('.inputName').val();
        const description: string = '' + dialogHTML.find('.inputDescription').val();
        return { name, description }
    }
}
