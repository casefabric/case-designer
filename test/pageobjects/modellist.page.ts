import { $, browser } from '@wdio/globals';
import CaseModelerPage from './casemodeler.page';
import CreateNewCaseDialog from './createnewcasedialog.page';

export class ModelListPanel {
    private get modelTabBase() {
        return $('.divModelList .divAccordionList');
    }

    public async selectModelTab(tabName: string) {
        await this.modelTabBase.$(`h3[filetype='${tabName}']`).click();
    }

    public async openModel(modelName: string) {
        await this.modelTabBase.$(`div[filename='${modelName}']`).click();
    }


    public async createCaseModel(caseName: string, teamName?: string) {
        await this.selectModelTab('case');
        await this.addCaseButton.click();
        await CreateNewCaseDialog.nameInput.addValue(caseName);
        await browser.keys('\t'); // now other fields get filled.

        if (teamName) {
            await CreateNewCaseDialog.teamSelect.selectByAttribute('value', teamName + ".caseteam");
        }

        await CreateNewCaseDialog.confirm();

        await this.modelTabBase.$(`div[filename='${caseName}.case']`).waitForDisplayed();

        await CaseModelerPage.shapebox.waitForDisplayed();
    }

    public get repositoryPanel() {
        return $('.divModelList');
    }
    public get addCaseButton() {
        return this.repositoryPanel.$('[filetype="case"] .plus-icon');
    }
}

export default new ModelListPanel();
