'use strict';

const consts = require('../constant.js');
const fs = require('fs');
const pathLib = require('path');
const walkSync = require('walk-sync');
const mkdirp = require('mkdirp');
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
        console.log(`Changing artifact ${artifactName} to ${newArtifactName} `);

        const analyzer = new StoreAnalyzer(this);
        const element = analyzer.models.find(model => model.fileName === artifactName);
        const usedIn = analyzer.findReferences(element);
        usedIn.forEach(reference => reference.setNewId(newArtifactName))

        const fileName = Utilities.createAbsolutePath(this.repositoryPath, artifactName);
        const newFileName = Utilities.createAbsolutePath(this.repositoryPath, newArtifactName);
        mkdirp.sync(pathLib.dirname(fileName));
        mkdirp.sync(pathLib.dirname(newFileName));
        fs.renameSync(fileName, newFileName);
        usedIn.forEach(reference => reference.model.save())
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
