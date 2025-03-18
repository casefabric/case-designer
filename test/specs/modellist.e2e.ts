import IDEPage from '../pageobjects/ide.page';
import ModelListPanel from '../pageobjects/modellist.page';

describe('Model list', async function () {
    it('open process model', async function () {
        await IDEPage.open();
        await IDEPage.modelList.waitForDisplayed();

        await ModelListPanel.selectModelTab('process');
        await ModelListPanel.openModel('allocatefunds.process');
        await IDEPage.modelEditor('allocatefunds.process').waitForDisplayed();
    });

    it('open type model', async function () {
        await IDEPage.open();
        await IDEPage.modelList.waitForDisplayed();

        await ModelListPanel.selectModelTab('type');
        await ModelListPanel.openModel('Helloworld.type');
        await IDEPage.modelEditor('Helloworld.type').waitForDisplayed();
    })

})
