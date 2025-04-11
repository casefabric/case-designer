import CaseModelerPage from '../pageobjects/casemodeler.page';
import IDEPage from '../pageobjects/ide.page';
import ModelListPanel from '../pageobjects/modellist.page';

describe('Case modeler', async function () {
    it('Open case model - validate modeler elements', async function () {
        await openCaseModel('a_new_moon.case');

        await CaseModelerPage.shapebox.waitForDisplayed();
    })
});
async function openCaseModel(caseName: string) {
    await IDEPage.open();
    await IDEPage.modelList.waitForDisplayed();

    await ModelListPanel.selectModelTab('case');
    await ModelListPanel.openModel(caseName);
}

