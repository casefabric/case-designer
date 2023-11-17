class ServerFile {
    /**
     * Creates a new local reference of the server file, based on the json structure given
     * by the server (serverData).
     * When created the reference does not yet hold the content. This can be loaded on 
     * demand through the load method, which can be invoked with a callback.
     * @param {Repository} repository 
     * @param {String} fileName 
     * @param {*} serverMetadata 
     */
    constructor(repository, fileName, serverMetadata = {}) {
        this.repository = repository;
        this.ide = this.repository.ide;
        this.fileName = fileName;
        this.refreshMetadata(serverMetadata);
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
     * @param {Metadata} serverMetadata 
     */
    refreshMetadata(serverMetadata) {
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
        this.lastModified = serverMetadata.lastModified;
    }

    get source() {
        return this._source;
    }

    set source(source) {
        this._source = source;
    }

    /**
     * Simple method that logs in the console where all this file is used according to the server side repository.
     * 
     */
    get usage() {
        return this.metadata.usage;
    }

    /**
     * File no longer exists in server...
     */
    deprecate() {
        // TODO: here we should check if there are any editors that are still open for this serverFile;
        //  if so, then we should show a message in those editors in an overlay, with a decision what to do.
        console.warn("Still using " + this.fileName + " ???  Better not, since it no longer exists in the server ...");
    }

    /**
     * Removes local content caches, in order to enforce reloading of the file when it's content is read.
     */
    clear() {
        if (this.source) {
            console.warn(`Clearing the contents of ${this.fileName}`);
        }
        this.source = undefined;
    }

    /**
     * Loads the data of file, and invokes the callback there-after.
     * @param {Function} callback 
     */
    fetch(callback) {
        if (this.source) {
            callback(this);
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
                    this.ide.info(msg);
                } else {
                    this.source = data;
                    callback(this);
                }
            },
            error: (xhr, error, eThrown) => {
                console.warn('Could not open ' + url, eThrown)
                // Cut the error message short.
                const str = ('' + eThrown).split('\n')[0];
                this.ide.danger('Could not read file ' + this.fileName + ' due to an error:<div>' + str + '</div>');
            }
        });
    }

    load(callback) {
        const file = this;
        this.fetch(_ => {
            const definition = ModelDocument.parse(this.ide, this)
            if (definition.hasMigrated()) {
                console.log(`Definition of ${definition.constructor.name} '${file.fileName}' has migrated; uploading result`);
                file.repository.saveXMLFile(file.fileName, definition.toXML());
            }
            callback(definition);
        })
    }

    /**
     * Uploads the XML content to the server, and invokes the callback after it.
     * Uploading to server gives also a new file list back, which we use to update the repository contents.
     * @param {Function} callback 
     */
    save(callback = undefined) {
        const xmlString = XML.prettyPrint(this.source);
        const url = '/repository/save/' + this.fileName;
        const type = 'post';
        $.ajax({
            url, data: xmlString, type,
            headers: { 'content-type': 'application/xml' },
            success: (data, status, xhr) => {
                this.hasBeenSavedJustNow = true;
                this.repository.updateFileList(data);
                this.hasBeenSavedJustNow = false;
                if (typeof (callback) == 'function') {
                    callback(data, status, xhr);
                } else {
                    // Also print a timestampe of the new last modified information
                    const lmDate = new Date(this.lastModified);
                    const HHmmss = lmDate.toTimeString().substring(0, 8);
                    const millis = ('000' + lmDate.getMilliseconds()).substr(-3);

                    console.log('Uploaded ' + this.fileName + ' at ' + HHmmss + ':' + millis);
                }
            },
            error: (xhr, error, eThrown) => {
                this.ide.danger('We could not save your work due to an error in the server. Please refresh the browser and make sure the server is up and running');
            }
        });
    }

    /**
     * Gives this file a new name
     * @param {String} newName the new name for the file
     * @param {Function} callback 
     */
    rename(newName, callback = undefined) {
        const url = '/repository/rename/' + this.fileName;
        const type = 'post';
        const data = JSON.stringify({ newName }, undefined, 2);
        $.ajax({ url, data, type,
            headers: { 'content-type': 'application/json' },
            success: (data, status, xhr) => {
                this.hasBeenSavedJustNow = true;
                this.fileName = newName;
                this.repository.updateFileList(data);
                this.hasBeenSavedJustNow = false;
                if (typeof (callback) == 'function') {
                    callback(data, status, xhr);
                } else {
                    // Also print a timestampe of the new last modified information
                    const lmDate = new Date(this.lastModified);
                    const HHmmss = lmDate.toTimeString().substring(0, 8);
                    const millis = ('000' + lmDate.getMilliseconds()).substr(-3);

                    console.log('Uploaded ' + this.fileName + ' at ' + HHmmss + ':' + millis);
                }
            },
            error: (xhr, error, eThrown) => {
                this.ide.danger('We could not rename the file: ' + error);
            }
        });
    }
}
