import IDEPage from './ide.page';

export class HumantaskModelEditor {
    private locator(post: string) {
        return IDEPage.currentModelEditor.$(`.humantask-model-editor ${post}`);
    }

    get nameInput() {
        return this.locator('.modelgenericfields .inputName');
    }

    get descriptionInput() {
        return this.locator('.modelgenericfields .inputDocumentation');
    }

    get generateUISchemeButton() {
        return this.locator('.buttonGenerateSchema');
    }

    inputModelParameterNameInput(index: number) {
        return this.locator(`.model-input-parameters tbody > tr:nth-child(${index}) .inputParameterName`);
    }

    inputModelParameterTypeSelect(index: number) {
        const selectLocator = this.locator(`.model-input-parameters tbody > tr:nth-child(${index}) select.inputParameterType`);
        selectLocator.click(); // options are loaded upon focus
        return selectLocator;
    }

    outputModelParameterNameInput(index: number) {
        return this.locator(`.model-output-parameters tbody > tr:nth-child(${index}) .inputParameterName`);
    }

    outputModelParameterTypeSelect(index: number) {
        const selectLocator = this.locator(`.model-output-parameters tbody > tr:nth-child(${index}) select.inputParameterType`);
        selectLocator.click(); // options are loaded upon focus
        return selectLocator;
    }
}

export default new HumantaskModelEditor();
