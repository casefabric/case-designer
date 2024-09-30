import Followup from "@util/promise/followup";
import ServerFile from "./serverfile";
import Metadata from "./metadata";
import ModelDefinition from "./definition/modeldefinition";

export default class RepositoryBase {
    public list: Array<ServerFile<ModelDefinition>> = [];

    isExistingModel(fileName: string): boolean {
        return false;
    }

    updateFileList(newServerFileList: Array<Metadata>, then: Followup = Followup.None) {}

    load(fileName: string, then: Followup = Followup.None) {}
}