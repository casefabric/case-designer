import { Request, Response } from 'express';
import ServerConfiguration from "./serverconfiguration";
import { Utilities } from "./utilities";

const serverConfig = new ServerConfiguration();

export default class Logger {
    public skip: any;

    constructor() {
        if (serverConfig.log_traffic === 'false' || serverConfig.logActions) {
            if (serverConfig.logActions) {
                // both actions and http failures
                console.log("-  console logging: both repository actions and HTTP errors are logged");
                Utilities.logMessage = (msg) => this.printAction(msg);
            } else {
                // Only http failures
                console.log("-  console logging: only HTTP errors are logged");
            }

            // Set a handler that logs failures
            this.skip = (_req: Request, res: Response) => {
                // Only log failures
                return res.statusCode < 400;
            }
        } else {
            console.log("-  console logging: all HTTP traffic is logged");
        }
    }

    printAction(msg: string) {
        if (serverConfig.logActions) {
            log(msg);
        }
    }
}

function log(msg: string) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(now + "|" + msg);
}
