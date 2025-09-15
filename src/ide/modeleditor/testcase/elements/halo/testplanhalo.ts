import TestPlanDefinition from "../../../../../repository/definition/testcase/testplandefinition";
import DeleteHaloItem from "../../../../editors/modelcanvas/halo/deletehaloitem";
import PrintHaloItem from "../../../../editors/modelcanvas/halo/printhaloitem";
import PropertiesHaloItem from "../../../../editors/modelcanvas/halo/propertieshaloitem";
import TestPlanView from "../testplanview";
import TestCaseHalo from "./testcasehalo";

export default class TestPlanHalo extends TestCaseHalo<TestPlanDefinition, TestPlanView> {
    createItems(): void {
        this.topBar.addItems(PropertiesHaloItem, DeleteHaloItem, PrintHaloItem);
    }

    setHaloPosition() {
        // Determine new left and top, relative to element's position in the case paper
        const casePaper = this.element.canvas.paperContainer!;

        // We need to make the halo a bit lower and on the right hand side of the top tab or the planning table.
        const leftCorrection = 260;
        const haloLeft = this.element.shape.x - (casePaper.scrollLeft() ?? 0) + leftCorrection;
        const haloTop = this.element.shape.y - (casePaper.scrollTop() ?? 0) + 22;

        this.html.css('left', haloLeft);
        this.html.css('top', haloTop);
        this.html.width(this.element.shape.width);
        this.html.height(this.element.shape.height);
    }

}
