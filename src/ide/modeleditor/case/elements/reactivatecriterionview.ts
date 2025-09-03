import ReactivateCriterionHalo from "./halo/cmmn/reactivatecriterionhalo";
import PlanItemView from "./planitemview";
import SentryView from "./sentryview";

export default class ReactivateCriterionView extends SentryView {
    static create(planItem: PlanItemView, x: number, y: number) {
        const definition = planItem.definition.createReactivateCriterion();
        const shape = planItem.case.diagram.createShape(x, y, 12, 20, definition.id);
        return new ReactivateCriterionView(planItem, definition, shape);
    }

    get markup() {
        return `<path style="pointer-events: bounding-box; fill:white; stroke:black; stroke-width:1" class="cmmn-shape cmmn-border cmmn-${this.constructor.name.toLowerCase()}-shape" d="M 3.827 2.137 L 9.807 1.377 L 5.657 8.494 L 11.141 7.923 L 2.696 19.454 L 5.157 11.663 L 0.787 12.164 C 0.85 12.173 3.827 2.137 3.827 2.137 Z" ></path>`;
    }

    get purpose() {
        return `This condition causes '${this.parent.name}' to reactivate - if it is in failed state`;
    }

    createHalo() {
        return new ReactivateCriterionHalo(this);
    }

    get isReactivateCriterion() {
        return true;
    }
}
