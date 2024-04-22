class HumanTaskFile extends ServerFile {
    createDefinition() {
        return new HumanTaskModelDefinition(this);
    }

    /** @returns {HumanTaskModelDefinition} */
    get definition() {
        return /** @type {HumanTaskModelDefinition} */ (this.content.definition);
    }
}
