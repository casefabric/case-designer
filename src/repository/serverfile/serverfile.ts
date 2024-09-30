import Followup, { andThen } from "@util/promise/followup";
import Util from "@util/util";
import XML from "@util/xml";
import $ from "jquery";
import ModelDefinition from "../definition/modeldefinition";
import RepositoryBase from "../repositorybase";
import Metadata from "./metadata";
import ServerFileReferences from "./serverfilereferences";

export default class ServerFile<M extends ModelDefinition> {
    private _fileName: any;
    private _source: any;
    private _definition?: M;
    private _xml?: Element;

    fileType: string;
    name: string;
    references: ServerFileReferences<M> = new ServerFileReferences(this);
    metadata: Metadata;
    lastModified: string = '';
    hasBeenSavedJustNow: boolean = false;
    clearing: boolean = false;

    /**
     * Creates a new local reference of the server file, based on the json structure given
     * by the server (serverData).
     * When created the reference does not yet hold the content. This can be loaded on 
     * demand through the load method, which can be invoked with a callback.
     */
    constructor(public repository: RepositoryBase, fileName: string, source: any) {
        this.repository = repository;
        this.name = ''; // Will be filled when the file name is set - which is also done after succesful rename actions
        this.fileType = ''; // Will be filled when the file name is set
        this.fileName = fileName;
        this.source = source;
        this.metadata = new Metadata({});
    }

    /**
     * Note: this method is private/protected
     */
    createModelDefinition(): M {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    get fileName() {
        return this._fileName;
    }

    /**
     * @param {String} fileName
     */
    set fileName(fileName) {
        if (fileName !== this._fileName) {
            this._fileName = fileName;
            // Split:  divide "myMap/myMod.el.case" into ["MyMap/myMod", "el", "case"]
            const splitList = fileName.split('.');
            this.fileType = splitList.pop(); // Last one is extension
            this.name = splitList.join('.'); // name becomes "MyMap/myMod.el"
        }
    }

    /**
     * Refreshes the metadata of the model, based on the server side content.
     */
    refreshMetadata(serverMetadata: Metadata) {
        this.metadata = serverMetadata;
        if (this.lastModified === serverMetadata.lastModified || this.hasBeenSavedJustNow) {
            // still the same contents, but potentially a new lastmodified timestamp
            // console.log("Data of "+this.fileName+" has not changed on the server-side");
            if (this.lastModified !== serverMetadata.lastModified) {
                // console.log("Updating timestamp of "+this.fileName+" from "+new Date(this.lastModified)+" to "+new Date(serverMetadata.lastModified));
                this.lastModified = serverMetadata.lastModified;
            }
        } else {
            this.clear();
        }
        if (serverMetadata.serverContent) {
            this.source = serverMetadata.serverContent;
        }
        this.lastModified = serverMetadata.lastModified;
    }

    get source() {
        return this._source;
    }

    set source(source) {
        if (this._source !== source) {
            this._definition = undefined;
            this._source = source;
            const xml = XML.parseXML(source);
            this._xml = xml ? xml.documentElement : xml;
        }
    }

    get definition(): M | undefined {
        return this._definition;
    }

    get xml() {
        return this._xml;
    }

    /**
      *  Returns an array with id/name of the files where this file is used in 
      */
    get usage() {
        return this.metadata?.usage;
    }

    /**
     *  @returns {Array<ServerFile>} Array with ServerFile's of the files where this file is used in 
     */
    get usageFiles() {
        return this.usage?.map(usage => usage.id).map(fileName => this.repository.list.find(file => file.fileName === fileName))
    }

    /**
     * File no longer exists in server...
     */
    deprecate() {
        // TODO: here we should check if there are any editors that are still open for this serverFile;
        //  if so, then we should show a message in those editors in an overlay, with a decision what to do.
        console.warn(`Still using ${this.fileName} ???  Better not, since it no longer exists in the server ...`);
    }

    /**
     * Removes local content caches, in order to enforce reloading of the file when it's content is read.
     */
    clear() {
        if (this.clearing) {
            return;
        }
        if (this.source === undefined && !this.definition) {
            // Nothing to clear here
            return;
        }
        console.groupCollapsed(`Clearing the contents of ${this.fileName} and ${this.references.size} referenced files`);
        this.clearing = true;
        this.source = undefined;
        this.references.clear();
        this.clearing = false;
        console.groupEnd();
    }

    /**
     * Loads the data of file, and invokes the callback there-after.
     */
    fetch(then: Followup) {
        if (this.source) {
            then.next(this);
            return;
        }

        const url = '/repository/load/' + this.fileName;
        const type = 'get';
        console.log('Loading ' + url);

        // Simple method for easy checking whether the functionality is still working ...
        // this.usage();

        $.ajax({
            url, type,
            success: (data, status, xhr) => {
                if (xhr.responseText == '') {
                    const msg = this.fileName + ' does not exist or is an empty file in the repository';
                    console.warn(msg);
                } else {
                    this.source = data;
                    // console.log(`Parsing ${this.fileName} during fetch`)
                    this.parse(then);
                }
            },
            error: (xhr, error, eThrown) => {
                console.warn('Could not open ' + url, eThrown)
                // Cut the error message short.
                const str = ('' + eThrown).split('\n')[0];
                then.fail(str);
            }
        });
    }

    /**
     * Parse the document and "then" callback
     * @param {Followup} then The next action that will be triggered after parsing completed
     */
    parse(then: Followup) {
        // console.groupEnd();
        // console.log("Parsing " + this.fileName);

        if (!this.source) {
            console.warn("No source content to parse")
            return;
        }
        if (!this.xml) {
            // There is no xml definition available to parse ...
            if (this.metadata) this.metadata.error = 'This file does not contain a valid XML document to parse';
            then.run(this);
            return;
        }
        const definition = this.createModelDefinition();
        this._definition = definition;
        definition.validateDocument();
        if (this.definition && this.definition.hasMigrated()) {
            console.log(`${this.definition.constructor.name} of '${this.fileName}' has migrated; uploading result`);
            this.source = this.definition.toXML();
            this.save(andThen(() => {
                definition.loadDependencies(() => {
                    // console.log("File["+file.fileName+"].definition: " + file.definition);
                    this.validateDefinition();
                    then.run(this);
                });
            }));
        } else {
            definition.loadDependencies(() => {
                // console.log("File["+file.fileName+"].definition: " + file.definition);
                this.validateDefinition();
                then.run(this);
            });
        }
    }

    /**
     * Hook to enable server files to check the actual definition for validity.
     * Used specifically in CaseFile to verify that the dimensions exist.
     */
    validateDefinition() {
    }

    /**
     * Load the file and parse it.
     * If the source of the file is not present, then it will be fetched from the server.
     * @param {Followup} then The next action that will be triggered after the file loaded (and optionally was parsed)
     */
    load(then = Followup.None) {
        this.fetch(andThen(_ => {
            if (!this.definition) {
                // console.log(`Parsing ${this.fileName} upon loading`)
                this.parse(andThen(file => then.run(file)));
            } else {
                then.run(this);
            }
        }));
    }

    /**
     * Clear the contents of the file and load it again from the server.
     * @param {Followup} then The next action that will be triggered after the file reloaded
     */
    reload(then = Followup.None) {
        this.clear();
        this.load(then);
    }

    /**
     * Uploads the XML content to the server, and invokes the callback after it.
     * Uploading to server gives also a new file list back, which we use to update the repository contents.
     * @param {Followup} then The next action that will be triggered after the file got saved
     */
    save(then = Followup.None) {
        if (!this.repository.isExistingModel(this.fileName)) { // temporary hack (i hope). creation should take care of this, instead of saving.
            this.repository.list.push(this);
        }

        const xmlString = XML.prettyPrint(this.source);
        const url = '/repository/save/' + this.fileName;
        const type = 'post';
        $.ajax({
            url, data: xmlString, type,
            headers: { 'content-type': 'application/xml' },
            success: (data, status, xhr) => {
                this.hasBeenSavedJustNow = true;
                this.repository.updateFileList(data, andThen(() => {
                    this.hasBeenSavedJustNow = false;
                    // Also print a timestampe of the new last modified information
                    const lmDate = new Date(this.lastModified);
                    const HHmmss = lmDate.toTimeString().substring(0, 8);
                    const millis = ('000' + lmDate.getMilliseconds()).substr(-3);
                    console.log('Uploaded ' + this.fileName + ' at ' + HHmmss + ':' + millis);

                    then.run(data, status, xhr);
                }));
            },
            error: (xhr, error, eThrown) => {
                const msg = 'We could not save your work due to an error in the server. Please refresh the browser and make sure the server is up and running';
                console.error(msg);
                then.fail(msg);
            }
        });
    }

    /**
     * Gives this file a new name
     * @param {String} newName the new name for the file
     * @param {Followup} then The next action that will be triggered after the file was renamed
     */
    rename(newName: string, then = Followup.None) {
        const oldName = this.fileName;
        const url = `/repository/rename/${oldName}?newName=${newName}`;
        const type = 'put';
        $.ajax({
            url, type,
            success: (data, status, xhr) => {
                this.hasBeenSavedJustNow = true;
                this.fileName = newName;
                this.repository.updateFileList(data, andThen(() => {
                    this.hasBeenSavedJustNow = false;
                    // Also print a timestampe of the new last modified information
                    const lmDate = new Date(this.lastModified);
                    const HHmmss = lmDate.toTimeString().substring(0, 8);
                    const millis = ('000' + lmDate.getMilliseconds()).substr(-3);

                    console.log(`Renamed ${oldName} to ${newName} at ${HHmmss}:${millis}`);
                    then.run(data, status, xhr);
                }));
            },
            error: (xhr, error, eThrown) => {
                then.fail('We could not rename the file: ' + error);
            }
        });
    }

    /**
     * Delete the file
     * @param {Followup} then The next action that will be triggered after the file was deleted
     */
    delete(then = Followup.None) {
        const url = '/repository/delete/' + this.fileName;
        const type = 'delete';
        $.ajax({
            url, type,
            success: (data, status, xhr) => {
                Util.removeFromArray(this.repository.list, this);
                this.repository.updateFileList(data, andThen(() => {
                    console.log('Deleted ' + this.fileName);
                    then.run(data, status, xhr);
                }));
            },
            error: (xhr, error, eThrown) => {
                then.fail('Failure while deleting file ' + this.fileName + ': ' + error);
            }
        });
    }

    /**
     * Loads the references and calls back with the reference, to the type the caller of this function expects
     */
    loadReference<X extends ModelDefinition>(fileName: string, callback: (file: ServerFile<X> | undefined) => void) {
        this.references.load(fileName, callback);
    }

    /**
     * Return a list of files that use this file.
     */
    usedBy() {
        return Util.removeDuplicates(this.repository.list.filter(file => file.references.contains(this)));
    }
}
