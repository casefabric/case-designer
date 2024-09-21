import RepositoryBrowser from "@ide/repositorybrowser";
import DragData from "./dragdata";

export default class ServerFileDragData extends DragData {
    constructor(repositoryBrowser: RepositoryBrowser, model: string, shapeType: string, imgURL: string, fileName: string) {
        super(repositoryBrowser.ide, repositoryBrowser, model, shapeType, imgURL, fileName);
    }
}
