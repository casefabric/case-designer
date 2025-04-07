import { Element } from "../../../../util/xml";
import CaseDefinition from "../casedefinition";
import EventListenerDefinition from "./eventlistenerdefinition";
import PlanningTableDefinition from "./planning/planningtabledefinition";
import TaskStageDefinition from "./taskstagedefinition";

export default class UserEventDefinition extends EventListenerDefinition {
    static get infix() {
        return 'ue';
    }

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: TaskStageDefinition | PlanningTableDefinition) {
        super(importNode, caseDefinition, parent);
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'userEvent');
    }
}
