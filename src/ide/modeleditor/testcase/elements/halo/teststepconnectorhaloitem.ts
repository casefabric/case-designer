import HaloDragItem from "../../../../editors/modelcanvas/halo/halodragitem";
import Images from "../../../../util/images/images";
import TestStepView from "../teststepview";
import TestCaseHalo from "./testcasehalo";

export default class TestStepConnectorHaloItem extends HaloDragItem<TestCaseHalo> {

    constructor(halo: TestCaseHalo) {
        super(halo, Images.Link, 'Precedence', halo.rightBar);
    }

    handleMouseUp(e: JQuery.TriggeredEvent) {
        super.handleMouseUp(e);
        const target = this.halo.element.canvas.getItemUnderMouse(e);
        if (!target) {
            return;
        }

        if (this.halo.element.isVariant) {
            let targetStep: TestStepView | undefined;

            if (target.isAssertion) {
                targetStep = target.parent! as TestStepView;
            }

            if (target.isVariant) {
                targetStep = target.parent! as TestStepView;
            }
            if (target.isStep) {
                targetStep = target as TestStepView;
            }

            if (target.isStartStep) {
                targetStep = undefined;
            }

            if (targetStep && targetStep.assertionView) {
                this.halo.element.__connect(targetStep.assertionView);
                targetStep.definition.createPredecessor(this.halo.element.definition);

                this.halo.element.canvas.editor.completeUserAction();
            }
        } else if (this.halo.element.isTextAnnotation && !target.isTestPlan) {
            this.halo.element.__connect(target);
        }
    }
}
