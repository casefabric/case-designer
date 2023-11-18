class ProcessFile extends ServerFileWithEditor {
    createEditor() {
        return new ProcessModelEditor(this);
    }

    /** @returns {ProcessModelDefinition} */
    get definition() {
        return /** @type {ProcessModelDefinition} */ (this.modelDocument.definition);
    }
}
