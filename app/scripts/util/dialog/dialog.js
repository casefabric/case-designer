class Dialog {
    /**
     * @param {IDE} ide
     * @param {string} label
     */
    constructor(ide, label) {
        this.ide = ide;
        this.label = label;
    }

    /**
     * 
     * @param {Function} callback 
     */
    showModalDialog(callback) {
        this.renderHeader();
        this.renderDialog();
        this.callback = callback;
        this.dialogHTML[0].showModal();
    }

    renderHeader() {
        if (!this.dialogHTML) {
            this.dialogHTML = $(`
            <dialog>
                <div class='dialogHeader'>
                    <label class="dialogLabel">${this.label}</label>
                    <br>
                    <br>
                </div>
            </dialog>`);
            this.ide.html.append(this.dialogHTML);
        }
        return this.dialogHTML;
    }

    get label() {
        return this._label;
    }

    set label(sLabel) {
        this._label = sLabel;
        if (this.dialogHTML) this.dialogHTML.find('.dialogLabel').html(sLabel);
    }

    /** @param {any} returnValue */
    closeModalDialog(returnValue) {
        if (this.callback) this.callback(returnValue);
        Util.removeHTML(this.dialogHTML);
    }

    renderDialog() {
        const htmlDialog = $(`<div>
                <button class='buttonOk'>OK</button>
                </div>`);
        this.dialogHTML.append(htmlDialog);
        htmlDialog.find('.buttonOk').on('click', e => this.closeModalDialog('Ok'));
    }
}
