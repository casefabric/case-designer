class HumanTaskFile extends ServerFileWithEditor {
    createEditor() {
        return new HumantaskModelEditor(this);
    }

    /** @returns {HumanTaskModelDefinition} */
    get definition() {
        return /** @type {HumanTaskModelDefinition} */ (this.modelDocument.definition);
    }
}
