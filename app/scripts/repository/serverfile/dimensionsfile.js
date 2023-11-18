class DimensionsFile extends ServerFile {
    /** @returns {Dimensions} */
    get definition() {
        return /** @type {Dimensions} */ (this.modelDocument.definition);
    }
}
