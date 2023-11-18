class CaseFile extends ServerFileWithEditor {
    createEditor() {
        return new CaseModelEditor(this);
    }

    /** @returns {CaseDefinition} */
    get definition() {
        return /** @type {CaseDefinition} */ (this.modelDocument.definition);
    }
}
