import $ from "jquery";
import FixtureDefinition from "../../../../../repository/definition/testcase/testfixturedefintion";
import HaloClickItem from "../../../../editors/modelcanvas/halo/haloclickitem";
import Images from "../../../../util/images/images";
import FixtureView from "../fixtureview";
import TestCaseHalo from "./testcasehalo";

export default class ZoomCaseDefinitionHaloItem extends
    HaloClickItem<TestCaseHalo<FixtureDefinition, FixtureView>> {
    constructor(halo: TestCaseHalo<FixtureDefinition, FixtureView>) {
        const implementationRef = halo.element.definition.caseRef?.fileName;
        const imgURL = Images.ZoomIn;
        const title = 'Open case implementation - ' + implementationRef + '\nRight-click to open in new tab';
        const html = $(`<a href="./#${implementationRef}" title="${title}" ><img src="${imgURL}" /></a>`);
        super(halo, imgURL, title, e => { window.location.hash = implementationRef; }, halo.bottomBar, html);
    }
}
