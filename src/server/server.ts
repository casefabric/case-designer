const startMoment = new Date();
console.log(`Starting Cafienne IDE Server at ${startMoment}`);
console.log('==================================================   ');

import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import walkSync from 'walk-sync';
import config from '../config/config';
import { Utilities } from './utilities';

const repositoryPath = config.repository;
const deployPath = config.deploy;

const router = express.Router();
const xmlParser = bodyParser.text({ type: 'application/xml', limit: '50mb' });

function replyList(res: Response) {
    res.json(getRepositoryFiles(false));
}

function replyContents(res: Response) {
    res.json(getRepositoryFiles(true));
}

/**
 * Returns the repository contents by name, last modified timestamp and usage information
 */
router.get('/list', (_req: Request, res: Response) => {
    logMessage(`LIST`);
    replyContents(res);
});

router.get('/config', (req, res) => {
    res.json(Object.assign({ server: config.backendUrl }));
});

/**
 *  Get a file from the repository.
 */
router.get('/load/*', function (req: Request, res: Response, _next) {
    const fileName = req.params[0];
    logMessage(`LOAD   /${fileName}`);
    try {
        const content = Utilities.readFile(repositoryPath, fileName);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('x-sent', 'true');
        res.send(content);
    } catch (err: any) {
        const error = err;
        if (error.code === 'ENOENT') {
            // File does not exist, just return an empty string
            res.sendStatus(404);
        } else {
            console.error(error);
            res.sendStatus(500);
        }
    }
});

/**
 * Save a file to the repository
 */
router.post('/save/*', xmlParser, function (req: Request, res: Response, _next) {
    try {
        const fileName = req.params[0];
        logMessage(`SAVE   /${fileName}`);
        Utilities.writeFile(repositoryPath, fileName, req.body);
        replyList(res);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

/**
 * Rename a file in the repository
 */
router.put('/rename/:fileName', xmlParser, function (req: Request, res: Response, _next) {
    // Note: this code takes the new name from the query parameter ?newName=
    try {
        const fileName = req.params.fileName;
        const newName = req.query.newName?.toString() ?? (() => { throw new Error('newName query parameter is required'); })();
        const newContent = req.body;
        logMessage(`RENAME /${fileName} to /${newName}`);
        Utilities.renameFile(repositoryPath, fileName, newName);
        Utilities.writeFile(repositoryPath, newName, newContent);
        replyContents(res);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

/**
 * Rename a file in the repository
 */
router.delete('/delete/*', function (req: Request, res: Response, _next) {
    try {
        const fileName = req.params[0];
        logMessage(`DELETE /${fileName}`);
        Utilities.deleteFile(repositoryPath, fileName);
        replyList(res);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

/**
 * Deploy a file and it's dependencies from the repository to the deployment folder
 */
router.post('/deploy/*', xmlParser, function (req: Request, res: Response, _next) {
    try {
        const fileName = req.params[0];
        logMessage(`DEPLOY /${fileName}`);
        Utilities.writeFile(deployPath, fileName, req.body);
        res.setHeader('Content-Type', 'application/xml');
        res.status(201).end();
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


const app = express();

const logOptions: any = {};
let logActions = false;
if (config.log_traffic === 'false' || config.log_traffic === 'actions') {
    logActions = config.log_traffic === 'actions';
    if (logActions) {
        // both actions and http failures
        console.log("-  console logging: both repository actions and HTTP errors are logged");
        Utilities.logMessage = logMessage;
    } else {
        // Only http failures
        console.log("-  console logging: only HTTP errors are logged");
    }

    // Set a handler that logs failures
    logOptions.skip = (_req: Request, res: Response) => {
        // Only log failures
        return res.statusCode < 400
    }
} else {
    console.log("-  console logging: all HTTP traffic is logged");
}
app.use(morgan('dev', logOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/node_modules', express.static(path.join(__dirname, '/../../node_modules')));

// Do not add static content when running in a docker container.
// The docker container serves static content via nginx
if (app.get('env') !== 'docker') {
    app.use(express.static(path.join(__dirname, '/../app')));
}

app.use('/repository', router);

// catch 404 and forward to error handler
app.use(function (req: Request, _res: Response, next) {
    const err: any = new Error('Not Found: ' + req.url);
    err.status = 404;
    next(err);
});

app.listen(config.serverPort, () => {
    const started = new Date();
    console.log('- backend endpoint: ' + config.backendUrl);
    console.log('- sources location: ' + path.resolve(repositoryPath));
    console.log('-  deploy location: ' + path.resolve(deployPath)); // Intentional double space to align both configuration values
    console.log('==================================================   ');
    const startMoment = new Date();
    console.log(`Cafienne IDE Server started (in ${started.getTime() - startMoment.getTime()}ms) on http://localhost:${config.serverPort}\n`);
});

function getRepositoryFiles(includeJson: boolean) {
    const fileCreator = (file: walkSync.Entry) => {
        const fileName = file.relativePath;
        const type = path.extname(fileName).substring(1);
        const lastModified = file.mtime;
        const content = includeJson ? Utilities.readFile(repositoryPath, fileName) : undefined;
        return { fileName, type, lastModified, content };
    }

    return Utilities.getRepositoryFiles(repositoryPath).map(fileCreator);
}

function logMessage(msg: string) {
    if (logActions) {
        log(msg);
    }
}

function log(msg: string) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(now + "|" + msg);
}
