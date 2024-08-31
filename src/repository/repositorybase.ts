import Followup from "@util/promise/followup";
import ServerFile from "./serverfile";
import Metadata from "./metadata";

export default class RepositoryBase {
    public list: Array<ServerFile> = [];

    isExistingModel(fileName: string): boolean {
        return false;
    }

    updateFileList(newServerFileList: Array<Metadata>, then: Followup = Followup.None) {}

    load(fileName: string, then: Followup = Followup.None) {}
}