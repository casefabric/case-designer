class CaseFile extends ServerFile {
    createDefinition() {
        return new CaseDefinition(this);
    }

    /** @returns {CaseDefinition} */
    get definition() {
        return /** @type {CaseDefinition} */ (this.content.definition);
    }
}
