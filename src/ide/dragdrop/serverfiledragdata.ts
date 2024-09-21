import RepositoryBrowser from "@ide/repositorybrowser";
import ServerFile from "@repository/serverfile";
import DragData from "./dragdata";

export default class ServerFileDragData extends DragData {
    constructor(repositoryBrowser: RepositoryBrowser, public file: ServerFile, imgURL: string) {
        super(repositoryBrowser, file.name, imgURL);
    }
}
