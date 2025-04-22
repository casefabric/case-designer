import { Element } from "../../../../../../util/xml";
import ExpressionContainer from "../../../expression/expressioncontainer";

export default class DueDateDefinition extends ExpressionContainer {
    static TAG = 'duedate';

    protected expressionTagName() {
        return 'condition';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, DueDateDefinition.TAG);
    }
}
