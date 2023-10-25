'use strict';

const { RepositoryElement } = require('./repositoryelement');
const { Reference } = require('./reference');
const Store = require('./store').Store;

/**
 * This class keeps track of artifacts usage.
 */
class StoreAnalyzer {
    /**
     * 
     * @param {Store} store 
     */
    constructor(store) {
        this.store = store;
        this.models = this.store.getElements();
        // Create analysis information on all models in the store. Parses them as XML, searches for referencing attributes.
        this.models.forEach(model => model.fillReferenceInformation());
    }

    /**
     * Extend the model information with the usage information
     */
    resolveUsageInformation() {
        this.models.forEach(source => source.usage.push(...this.findReferences(source).map(reference => reference.usage)));
    }

    /**
     * 
     * @param {RepositoryElement} source 
     * @returns {Array<Reference>}
     */
    findReferences(source) {
        const references = this.models.map(model => model.referencedArtifacts.filter(reference => reference.id === source.fileName)).filter(use => use.length > 0);
        // Flatten to set and then make it an array ...
        return Array.from(new Set(flatten(references)));
    }
}

/**
 * Recursive flattener for older node.js version we're on :(
 * @param {Array<Array<Reference>>} array 
 * @returns {Array<Reference>}
 */
function flatten(array) {
    const result = [];
    array.forEach(element => result.push(...element))
    return result;
}

exports.StoreAnalyzer = StoreAnalyzer;
