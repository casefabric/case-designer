import Util from "../util/util";
import ModelDefinition from "./definition/modeldefinition";
import Metadata from "./serverfile/metadata";
import ServerFile from "./serverfile/serverfile";

export default class RepositoryBase {
    public readonly list: Array<ServerFile<ModelDefinition>> = [];

    async listModels() {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    addFile(file: ServerFile<ModelDefinition>) {
        // if (this.list.find(item => file.fileName === item.fileName)) {
        //     throw new Error("File " + file.fileName + " already exists")
        // }
        // console.warn("Adding file " + file)
        this.list.push(file);
    }

    removeFile(file: ServerFile<ModelDefinition>) {
        // console.log("Removing file " + file +" from the repository list");
        Util.removeFromArray(this.list, file);
    }

    getFile(fileName: string): ServerFile<ModelDefinition> | undefined {
        return this.list.find(file => file.fileName === fileName);
    }

    hasFile(fileName: string): boolean {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    async updateMetadata(newServerFileList: Array<Metadata>) {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    async load<X extends ModelDefinition>(fileName: string): Promise<ServerFile<X>> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }
}
