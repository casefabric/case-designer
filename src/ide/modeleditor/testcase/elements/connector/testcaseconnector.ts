import Edge from "../../../../../repository/definition/dimensions/edge";
import Connector from '../../../../editors/modelcanvas/connector/connector';
import TestCaseElementView from "../testcaseelementview";

export default class TestCaseConnector extends Connector<TestCaseElementView> {

    constructor(public source: TestCaseElementView, public target: TestCaseElementView, public edge: Edge) {
        super(source, target, edge);

        this.link.connector('smooth');
        this.link.attr({
            line: {
                targetMarker: {
                    type: 'path',
                    stroke: '#423d3d',
                    fill: 'white'
                }
            }
        });

    }
}
