import FixtureDefinition from "../../../../../repository/definition/testcase/testfixturedefintion";
import FixtureView from "../fixtureview";
import TestCaseHalo from "./testcasehalo";
import ZoomCaseDefinitionHaloItem from "./zoomcasedefinitionhaloitem";

export default class FixtureHalo extends TestCaseHalo<FixtureDefinition, FixtureView> {
    createItems(): void {
        super.createItems();
        this.bottomBar.addItems(ZoomCaseDefinitionHaloItem);
    }
}
