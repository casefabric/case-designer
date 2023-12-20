'use strict';

const consts = require('../constant.js');
const fs = require('fs');
const pathLib = require('path');
const walkSync = require('walk-sync');
const mkdirp = require('mkdirp');
const { XML } = require('../xml.js');
const RepositoryElement = require('./repositoryelement.js').RepositoryElement;
const StoreAnalyzer = require('./storeanalyzer.js').StoreAnalyzer;
const Utilities = require('../utilities.js').Utilities;

class Store {
    constructor(repositoryPath) {
        this.repositoryPath = repositoryPath;
    }

    /**
     * 
     * @param {string} artifactName 
     * @returns 
     */
    load(artifactName) {
        const fileName = Utilities.createAbsolutePath(this.repositoryPath, artifactName);
        const content = fs.readFileSync(fileName, { encoding: 'utf8' });
        return content;
    }

    save(artifactName, data) {
        const fileName = Utilities.createAbsolutePath(this.repositoryPath, artifactName);
        mkdirp.sync(pathLib.dirname(fileName));
        fs.writeFileSync(fileName, data);
    }

    rename(artifactName, newArtifactName) {
        const analyzer = new StoreAnalyzer(this);
        const model = analyzer.models.find(model => model.fileName === artifactName);
        const usedIn = analyzer.findReferences(model);
        usedIn.forEach(reference => reference.setNewId(newArtifactName))

        const fileName = Utilities.createAbsolutePath(this.repositoryPath, artifactName);
        const newFileName = Utilities.createAbsolutePath(this.repositoryPath, newArtifactName);
        mkdirp.sync(pathLib.dirname(fileName));
        mkdirp.sync(pathLib.dirname(newFileName));
        fs.renameSync(fileName, newFileName);

        const nameReader = (/** @type {String} */ nameWithExtension) => {
            const splitList = nameWithExtension.split('.');
            splitList.pop(); // Last one is extension, we should remove it.
            return splitList.join('.'); // name becomes "MyMap/myMod.el"
        }

        // Also rename the value of the id attribute (if it exists and holds exactly the old file name)
        if (model.xml.element.getAttribute('id') === artifactName) {
            model.xml.element.setAttribute('id', newArtifactName);
            const oldName = nameReader(artifactName);
            const modelName = model.xml.element.getAttribute('name');
            const newModelName = oldName === modelName ? nameReader(newArtifactName) : modelName;
            model.xml.element.setAttribute('name', newModelName);
            console.log(` ===> UPDATE <${model.xml.element.tagName} id="${artifactName}" name="${oldName}">...</> to <${model.xml.element.tagName} id="${newArtifactName}" name="${newModelName}">...</>`);
            

            this.save(newArtifactName, XML.printNiceXML(model.xml.element) + '\n');
        }
        usedIn.forEach(reference => reference.model.save())
    }

    delete(artifactName) {
        const fileName = Utilities.createAbsolutePath(this.repositoryPath, artifactName);
        fs.unlinkSync(fileName);
    }

    /**
     * 
     * @returns {Array<RepositoryElement>}
     */
    getElements() {
        const files = walkSync.entries(this.repositoryPath, { directories: false, ignore: ['**/.*'] });
        return files.filter(file => Utilities.isKnownRepositoryExtension(pathLib.extname(file.relativePath))).map(entry => new RepositoryElement(this, entry));
    }

    list() {
        const analyzer = new StoreAnalyzer(this);
        analyzer.resolveUsageInformation();
        // console.log("\n\nFound models and resolved usage info: " + analyzer.models.map(model => JSON.stringify(model.usage)))
        return analyzer.models.map(modelInfo => modelInfo.apiInformation);
    }
}

exports.Store = Store;
