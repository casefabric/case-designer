import HaloDragItem from "../../../../editors/modelcanvas/halo/halodragitem";
import Images from "../../../../util/images/images";
import TestStepAssertionsView from "../testassertionsview";
import TestCaseHalo from "./testcasehalo";

export default class TestStepConnectorHaloItem extends HaloDragItem<TestCaseHalo> {

    constructor(halo: TestCaseHalo) {
        super(halo, Images.LinkSmall, 'Precedence', halo.rightBar);
    }

    handleMouseUp(e: JQuery.TriggeredEvent) {
        super.handleMouseUp(e);
        const target = this.halo.element.canvas.getItemUnderMouse(e);
        if (target && target.isAssertion) {
            this.halo.element.__connect(target);

            const assertion = target as TestStepAssertionsView;
            assertion.definition.createPrecessesor(this.halo.element.definition);

            this.halo.element.canvas.editor.completeUserAction();
        }
    }
}
