import HaloClickItem from "../../../../../../../editors/modelcanvas/halo/haloclickitem";
import Images from "../../../../../../../util/images/images";
import CaseHalo from "../../../casehalo";

export default class DebuggerHaloItem extends HaloClickItem<CaseHalo> {
    constructor(halo: CaseHalo) {
        super(halo, Images.Debug, 'Debug cases of this type', () => window.location.hash = `${this.halo.element.canvas.caseDefinition.file.fileName}?debug=`);
    }
}
