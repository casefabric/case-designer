import { join } from 'path';
import { IndexGenerator } from './indexgenerator.js';

const directoryPath = join(process.cwd(), './src'); // TODO make the input a command line argument

console.group("======== Generating index.js file")
const generator = new IndexGenerator(directoryPath);
console.log("Collecting source files inside " +directoryPath);
generator.collectFiles();
console.log("Generating export statements");
generator.generateExportStatements();
generator.writeIndexFile();
console.groupEnd()
console.log("======== Completed index generation process")
