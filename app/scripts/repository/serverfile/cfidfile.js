class CFIDFile extends ServerFile {
    /** @returns {CaseFileDefinitionDefinition} */
    get definition() {
        return /** @type {CaseFileDefinitionDefinition} */ (this.modelDocument.definition);
    }
}
