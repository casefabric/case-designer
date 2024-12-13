import Metadata from "../serverfile/metadata";

export default class FileStorage {
    async renameModel(fileName: string, newFileName: string, updatedContent: any): Promise<Metadata[]> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    async saveModel(fileName: string, source: any): Promise<Metadata[]> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    async deleteModel(fileName: string): Promise<Metadata[]> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    async loadModel(fileName: string): Promise<any> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    async listModels(): Promise<Metadata[]> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }
}
