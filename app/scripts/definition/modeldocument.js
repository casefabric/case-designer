class ModelDocument {
    /**
     * 
     * @param {IDE} ide 
     * @param {String} fileName 
     * @param {*} source 
     */
    constructor(ide, fileName, source) {
        this.ide = ide;
        this.fileName = fileName;
        this.source = source;
    }

    get source() {
        return this._source;
    }

    set source(source) {
        // If we get a new source, flatten and parse it, and also remove the existing definition
        if (source && source !== this._source) {
            this._source = source && source instanceof Document ? XML.prettyPrint(source) : source;
            this.xml = source && source instanceof Document ? source : XML.parseXML(source);
            this.definition = undefined;
        }
    }

    /**
     * @returns {Element}
     */
    get root() {
        return this.xml && this.xml.documentElement;
    }

    /** @type {ModelDefinition} */
    get definition() {
        if (!this._definition) {
            this._definition = this.createDefinitionObject();
            this._definition.parseDocument();
            this._definition.validateDocument();
        }
        return this._definition;
    }

    set definition(definition) {
        this._definition = definition;
    }

    /**
     * @returns {ModelDefinition}
     */
    createDefinitionObject() {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }
}

function getParser(ide, fileName, fileType, source) {
    if (fileType == 'case') {
        return new CaseModelDocument(ide, fileName, source);
    } else if (fileType == 'process') {
        return new ProcessModelDocument(ide, fileName, source);
    } else if (fileType == 'humantask') {
        return new HumanTaskModelDocument(ide, fileName, source);
    } else if (fileType == 'dimensions') {
        return new DimensionsModelDocument(ide, fileName, source);
    } else if (fileType == 'cfid') {
        return new CaseFileModelDocument(ide, fileName, source);
    } else {
        throw new Error('FileType ' + fileType + ' is not supported');
    }

}

class CaseModelDocument extends ModelDocument {
    createDefinitionObject() {
        return new CaseDefinition(this.root);
    }
}

class DimensionsModelDocument extends ModelDocument {
    createDefinitionObject() {
        return new Dimensions(this.root);
    }
}

class ProcessModelDocument extends ModelDocument {
    createDefinitionObject() {
        return new ProcessModelDefinition(this.root);
    }
}

class HumanTaskModelDocument extends ModelDocument {
    createDefinitionObject() {
        return new HumanTaskModelDefinition(this.root);
    }
}

class CaseFileModelDocument extends ModelDocument {
    createDefinitionObject() {
        return new CaseFileDefinitionDefinition(this.root);
    }
}
