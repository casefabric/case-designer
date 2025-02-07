# CaseFabric Repository
A TypeScript package that can create and compile independent files CaseFabric design time source files into CMMN compliant definitions file.

# Compilation Usage 

This package can be used to do compilation of CaseFabric source models.

## Setup
It assumes a setup with 2 folders on disk, one having the source models, the other as the target for the compiled models. The latter one will be created if it does not exist.

The default locations are:

```
./repository
./repository_deploy
```

The locations can be overriden through environment variables

```
MODELER_REPOSITORY_PATH = your_source_folder_for_models
MODELER_DEPLOY_PATH = your_target_folder_for_compiled_models
```

## Using NPX

With the settings above filled, it is possible to run the tool from `npx`:

```bash
npx @casefabric/repository
```

## More complex setup

An alternative, more complex project setup with a `package.json` file should contain (at least) the below content

```json
{
  "dependencies": {
    "@casefabric/repository": "1.1.0"
  }
}
```

For example
```json
{
...
  "scripts": {
    "compileModel": "cross-env MODELER_REPOSITORY_PATH=./src/casemodels MODELER_DEPLOY_PATH=./dist/cmmn transpile",
  },
  "devDependencies": {
    "@casefabric/repository": "^0.0.1",
    "cross-env": "^7.0.3"
  }
...
}
```

In a project with the following structure:

```
// Raw source:

src/
└── casemodels
    ├── a_new_moon.case
    └── greeting.type

↓↓↓

// Transpiled with @cafienne/repository

dist/
└── cmmn
    └── a_new_moon.xml
```



Then install the package with you favorite package manager, e.g. `npm` or `yarn`.

## Running the compilation

### Compiling entire directory
Take the following steps to compile the source models in the directory

```bash
npm run transpile
```

Or with the example setup above:
```bash
npm run compileModel
```


### Compiling a specific set of models

```bash
npm run transpile helloworld.case hellomoon etc ...

// Alternatively with npx
npx @casefabric/repository helloworld.case hellomoon etc ...

```

The transpile command will check if the arguments can be resolved to a file in the source folder.
If a file cannot be found, it will print an error message for that specific file, and continue with the remaining arguments.

Note that the filename resolution is case sensitive
