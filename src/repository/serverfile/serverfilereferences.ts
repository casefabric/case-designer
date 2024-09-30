import ServerFile from "@repository/serverfile/serverfile";
import { andThen } from "@util/promise/followup";
import Util from "@util/util";
import ModelDefinition from "../definition/modeldefinition";

export default class ServerFileReferences<M extends ModelDefinition> {
    files: ServerFile<ModelDefinition>[] = [];

    constructor(private source: ServerFile<M>) {
    }

    get size() {
        return this.files.length;
    }

    clear() {
        this.files.forEach(file => file.clear());
        Util.clearArray(this.files);
    }

    /**
     * Returns all files that this file references, and also all _their_ references.
     */
    get all() {
        const set = new Array();
        this.files.forEach(file => {
            set.push(file);
            file.references.all.forEach((reference: ServerFile<ModelDefinition>) => set.push(reference));
        });
        return Util.removeDuplicates(set);
    }

    contains(file: ServerFile<ModelDefinition>) {
        return this.all.find(reference => reference === file) !== undefined;
    }

    load<X extends ModelDefinition>(fileName: string, callback: (file: ServerFile<X> | undefined) => void) {
        const file = this.files.find(file => file.fileName === fileName);
        if (file) {
            // console.log(this.source.fileName + " requested " + fileName + " and it is already in our list, with definition: " + file.definition)
            // @ts-ignore ==> if you cast to the wrong type, that's really your problem ;)
            callback(file);
        } else {
            // console.log(this.source.fileName + " requested " + fileName + " and need to load it")
            this.source.repository.load(fileName, andThen(file => {
                if (file) {
                    // console.log(this.source.fileName + " requested " + fileName + " and loaded it, with definition " + file.definition)
                    this.files.push(file);
                }
                callback(file);
            }));
        }
    }
}
