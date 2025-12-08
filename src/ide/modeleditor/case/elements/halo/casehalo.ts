import CMMNElementDefinition from "../../../../../repository/definition/cmmn/cmmnelementdefinition";
import Halo from "../../../../editors/modelcanvas/halo/halo";
import CaseElementView from "../caseelementview";

export default class CaseHalo<E extends CMMNElementDefinition = CMMNElementDefinition,
    V extends CaseElementView<E> = CaseElementView<E>>
    extends Halo<E, V> {
}
