class DimensionsFile extends ServerFile {
    createDefinition() {
        return new Dimensions(this.content.xml);
    }

    /** @returns {Dimensions} */
    get definition() {
        return /** @type {Dimensions} */ (this.content.definition);
    }
}
