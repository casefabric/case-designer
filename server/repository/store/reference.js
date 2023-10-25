'use strict';

const { RepositoryElement } = require("./repositoryelement");
const { Usage } = require("./usage");

class Reference {
    /**
     * 
     * @param {RepositoryElement} model 
     * @param {Element} element 
     * @param {String} attributeName
     */
    constructor(model, element, attributeName) {
        this.model = model;
        this.element = element;
        this.attributeName = attributeName;
        this.id = element.getAttribute(attributeName);
        // console.log("Model "+ model.fileName + " references " + id)
    }

    get usage() {
        return new Usage(this.model.fileName, this.model.id);
    }

    setNewId(newId) {
        this.id = newId;
        this.element.setAttribute(this.attributeName, newId);
    }
}

exports.Reference = Reference;