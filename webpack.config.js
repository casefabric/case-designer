const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const devMode = process.env.DEV_MODE ? process.env.DEV_MODE.trim().toLowerCase() === 'true' : false;

class BuildPrinter {
    constructor(name) {
        this.buildName = name;
        this.buildNumber = 1;
    }
}

/**
 * 
 * @param {BuildPrinter} hook 
 */
function addBuildHook(hook) {
    return new function () {
        console.log(`Adding build hook '${hook.buildName}'`)
        this.apply = (compiler) => compiler.hooks.done.tap(hook.buildName, () => setTimeout(() => console.log(`\n=== ${new Date().toTimeString().split(' ')[0]} completed ${hook.buildName} build ${hook.buildNumber++} ===\n`), 0));
    }
} 

const moduleRules = {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /[/\\]node_modules[/\\]/,
            include: [
                /[/\\]src[/\\]/,
                /[/\\]server[/\\]/
            ],
        },
        {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
        },
    ],
};

const scriptExtensions = {
    extensions: ['.ts', '.js'],
}

const ideResolvers = {
    extensions: ['.tsx', '.ts', '.js', '.html'],
    alias: {
        '@styles': path.resolve(__dirname, 'app/styles'),
        '_images_': path.resolve(__dirname, 'app/images'),
        'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery'),
        'jquery-ui': path.resolve(__dirname, 'node_modules/jquery-ui/dist/jquery-ui'),
    },
};

module.exports = [{
    entry: {
        server: './src/server/server.ts'
    },
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist/server'),
    },
    plugins: [
        addBuildHook(new BuildPrinter('server'))
    ],
    target: 'node',
    module: moduleRules,
    resolve: scriptExtensions,
    externals: [nodeExternals()],
    devtool: 'source-map',
    mode: 'development',
    stats: {
        errorDetails: true
    },
    watch: devMode,
},
{
    entry: {
        ide: './src/ide/index.ts',
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist/app'),
    },
    plugins: [
        addBuildHook(new BuildPrinter('ide')),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'app' },
            ]
        })
    ],
    module: moduleRules,
    resolve: ideResolvers,
    devtool: 'source-map',
    mode: 'development',
    stats: {
        errorDetails: true
    },
    watch: devMode,
}];
