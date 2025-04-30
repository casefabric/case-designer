import { $ } from '@wdio/globals';

export class CreatenewCaseDialog  {
    private get dialogBase () {
        return $('dialog');
    }

    public async confirm () {
        await this.dialogBase.$(`.buttonOk`).click();
    }

    public async candel () {
        await this.dialogBase.$(`.buttonCancel`).click();
    }

    public get nameInput () {
        return this.dialogBase.$('.inputName');
    }
    public get descriptionInput () {
        return this.dialogBase.$('.inputDescription');
    }
    public get typeSelect () {
        return this.dialogBase.$('.selectType');
    }
    public get teamSelect () {
        return this.dialogBase.$('.selectCaseTeam');
    }
}

export default new CreatenewCaseDialog();
