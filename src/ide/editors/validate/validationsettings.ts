import Settings from "../../settings/settings";

export default class ValidationSettings {

    private _visible: boolean = false;

    get visible() {
        return this._visible;
    }

    /**
     * @param {Boolean} visible
     */
    set visible(visible) {
        if (this._visible != visible) {
            this._visible = visible;
            this.save();
        }
    }

    save() {
        Settings.validations = this;
    }
}
