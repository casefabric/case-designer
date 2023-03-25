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
        this.source = source instanceof Document ? XML.prettyPrint(source) : source;
        this.xml = source instanceof Document ? source : XML.parseXML(source);
        /** @type{Element} */
        this.root = this.xml.documentElement;
    }

    /**
     * 
     * @param {IDE} ide 
     * @param {ServerFile} serverFile 
     */
    static parse(ide, serverFile) {
        const source = serverFile.data;
        const fileName = serverFile.fileName;
        const fileType = serverFile.fileType;
        const document = getParser(ide, fileName, fileType, source);
        return document.createInstance();
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
    createInstance() {
        const model = new CaseDefinition(this);
        model.parseDocument();
        model.validateDocument();
        return model;
    }
}

class DimensionsModelDocument extends ModelDocument {
    /**
     * 
     * @param {IDE} ide 
     * @param {String} fileName 
     * @param {*} source 
     */
    constructor(ide, fileName, source) {
        super(ide, fileName, source);
        const diagram = XML.getChildByTagName(this.root, CMMNDIAGRAM);
        this.root = diagram;
    }

    createInstance() {
        const model = new Dimensions(this);
        model.parseDocument();
        model.validateDocument();
        return model;
    }
}

class ProcessModelDocument extends ModelDocument {
    createInstance() {
        const model = new ProcessModelDefinition(this);
        model.parseDocument();
        model.validateDocument();
        return model;
    }
}

class HumanTaskModelDocument extends ModelDocument {
    createInstance() {
        const model = new HumanTaskModelDefinition(this);
        model.parseDocument();
        model.validateDocument();
        return model;
    }
}

class CaseFileModelDocument extends ModelDocument {
    createInstance() {
        const model = new CaseFileDefinitionDefinition(this);
        model.parseDocument();
        model.validateDocument();
        return model;
    }
}
