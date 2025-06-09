import ServerFile from "../../repository/serverfile/serverfile";
import RepositoryBrowser from "../browser/repositorybrowser";
import DragData from "./dragdata";

export default class ServerFileDragData extends DragData {
    constructor(repositoryBrowser: RepositoryBrowser, public file: ServerFile, imgURL: string) {
        super(repositoryBrowser, file.name, imgURL);
    }
}
