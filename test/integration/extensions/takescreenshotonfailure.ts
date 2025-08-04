import { addProperty } from '@wdio/junit-reporter';

type logEvent = {
    level: string;
    message: string;
    timestamp: string;
}

// filter out those warnings
const ignoreEvents = [
    /: no source content to parse/, // due to parallel execution;
    /Still using [^\s]* \?\?\?  Better not, since it no longer exists in the server .../, // due to parallel execution
    /Cannot add renderer again found/, // due to issues in TypeEditor
    /Updating the task name to/, // not a real warning, should be info?
]

export const mochaHooks = {
    afterEach: async function () {
        this.test.title = `Screenshot for : ${this.currentTest.title}`;

        if (this.currentTest.state != 'passed') {
            addProperty("attachment", `data:image/png;base64,${await browser.takeScreenshot()}`);
        }

        // note wdio.conf.ts (aftertest) stores a screenshot in the testresults folder
    }
};
