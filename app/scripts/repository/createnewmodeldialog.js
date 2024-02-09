class CreateNewModelDialog extends Dialog {
    /**
     * @param {IDE} ide
     * @param {string} label
     */
    constructor(ide, label)
    {
        super(ide, label);
    }

    get name() {
        return this.dialogHTML.find('.inputName').val();
    }

    get description() {
        return this.dialogHTML.find('.inputDescription').val();
    }

    renderDialog() {
        const htmlDialog = $(`
            <label style="width:150px">Name</label><input class = "inputName"/>
            <br>
            <label style="width:150px">Description</label><input class = "inputDescription"/>
            <br>
            <br>
            <button class='buttonOk'>OK</button>
            <button class='buttonCancel'>Cancel</button>
        `);
        this.dialogHTML.append(htmlDialog);
        this.dialogHTML.find('.buttonOk').on('click', e => this.closeModalDialog({name: this.name, description: this.description}));
        this.dialogHTML.find('.buttonCancel').on('click', e => this.closeModalDialog(false));
    }
}
