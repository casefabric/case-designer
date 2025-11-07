import $ from "jquery";
import Importer from "../repository/import/importer";
import Repository from "../repository/repository";
import ServerFile from "../repository/serverfile/serverfile";
import RepositoryBrowser from "./browser/repositorybrowser";
import IDEFooter from "./idefooter";
import IDEHeader from "./ideheader";
import IDEMain from "./idemain";
import MessageBox from "./messagebox";
import RemoteFileStorage from "./remotefilestorage";
import SettingsEditor from "./settings/settingseditor";
import StylesLoader from "./stylesloader";

// First load all styles and then forget about it :(
new StylesLoader();

export default class IDE {
    repository: Repository;
    html: JQuery<HTMLElement>;
    header: IDEHeader;
    main: IDEMain;
    footer: IDEFooter;
    messageBox: MessageBox;
    settingsEditor: SettingsEditor;

    constructor() {
        this.repository = new Repository(new RemoteFileStorage(window.location.origin));
        this.html = $('body');
        this.header = new IDEHeader(this);
        this.main = new IDEMain(this);
        this.footer = new IDEFooter(this);
        this.messageBox = new MessageBox(this);
        this.settingsEditor = new SettingsEditor(this);

        // Repository object handles the interaction with the server
        this.html.on('keydown', e => {
            if (e.which == 83 && e.altKey) { // ALT S
                this.settingsEditor.show();
            }
        });

        // Scan for pasted text. It can upload and re-engineer a deployed model into a set of files
        this.html.on('paste', e => this.handlePasteText(e));
    }

    handlePasteText(e: JQuery.TriggeredEvent) {
        const pastedText = (<any>e).originalEvent.clipboardData.getData('text/plain');
        const importer = new Importer(this.repository, pastedText);
        if (importer.files.length > 0) {
            console.log(`Found ${importer.files.length} files to import`)
            const fileNames = importer.files.map(file => file.fileName);
            if (confirm('Press OK to upload the following ' + fileNames.length + ' files\n\n- ' + (fileNames.join('\n- ')))) {
                importer.uploadFiles();
            }
        }
    }

    open(file: ServerFile) {
        window.location.replace('#' + file.fileName);
    }

    get repositoryBrowser(): RepositoryBrowser {
        return this.main.repositoryBrowser;
    }

    /**
     * Shows a green success message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    success(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'success', delay);
    }

    /** 
     * Shows a blue info message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    info(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'info', delay);
    }

    /** 
     * Shows a yellow warning message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    warning(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'warning', delay);
    }

    /** 
     * Shows a red danger message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    danger(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'danger', delay);
    }
}
