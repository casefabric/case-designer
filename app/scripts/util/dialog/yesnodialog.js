class YesNoDialog extends Dialog {
    /**
     * @param {IDE} ide
     * @param {string} label
     */
    constructor(ide, label)
    {
        super(ide, label);
    }

    renderDialog() {
        const htmlDialog = $(`<div>
                <button class='buttonYes'>Yes</button>
                <button class='buttonNo'>No</button>
                </div>`);
        this.dialogHTML.append(htmlDialog);
        htmlDialog.find('.buttonYes').on('click', e => this.closeModalDialog('Yes'));
        htmlDialog.find('.buttonNo').on('click', e => this.closeModalDialog('No'));
    }
}
