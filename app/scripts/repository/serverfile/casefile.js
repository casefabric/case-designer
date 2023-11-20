class CaseFile extends ServerFileWithEditor {
    createEditor() {
        return new CaseModelEditor(this);
    }

    createDefinition() {
        return new CaseDefinition(this.content.xml);
    }

    /** @returns {CaseDefinition} */
    get definition() {
        return /** @type {CaseDefinition} */ (this.content.definition);
    }
}
