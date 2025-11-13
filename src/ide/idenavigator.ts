import ServerFile from "../repository/serverfile/serverfile";
import Util from "../util/util";
import IDE from "./ide";

export default class IDENavigator {
    constructor(public ide: IDE) {
        this.fileName = this.refresh();
    }

    load(file: ServerFile) {
        console.log("Loading file " + file.fileName);
        this.navigate(file.fileName);
    }

    navigate(url: string) {
        console.log("Navigating to " + url);
        window.location.hash = url;
        // https://stackoverflow.com/questions/2305069/can-you-use-hash-navigation-without-affecting-history
        // history.replaceState(undefined, undefined, "#hash_value")
        this.refresh();
    }

    get hash() {
        return this;
    }

    goHome() {
        this.navigate('');
    }

    fileName: string;
    options: NavigationOption[] = [];

    private refresh(url = window.location.hash) {
        console.log("Refreshing navigation options for: " + url);
        const hash = url.slice(1); // remove the leading #
        const queryIndex = hash.indexOf('?');
        this.fileName = queryIndex > 0 ? hash.slice(0, queryIndex) : hash;
        const query = queryIndex > 0 ? hash.slice(queryIndex + 1) : '';
        this.options = query.split('&').map(part => new NavigationOption(part.split('=')));
        return this.fileName;
    }

    private render() {
        const newHash = this.fileName + (this.options.length > 0 ? '?' + this.options.filter(o => o.isValid()).map(o => `${o.name}=${o.value}`).join('&') : '');
        console.log("Rendering new hash: " + newHash);
        // window.location.hash = newHash;
        window.location.replace('#' + newHash);
    }

    remove(option: string) {
        const o = this.get(option);
        if (o !== undefined) {
            Util.removeFromArray(this.options, o);
        }
        this.render();
    }

    add(option: string) {
        const o = this.get(option);
        if (o === undefined) {
            this.options.push(new NavigationOption([option, 'true']));
        }
        this.render();
    }

    private get(option: string): NavigationOption | undefined {
        this.refresh();
        return this.options.find(o => o.name === option);
    }

    contains(option: string): boolean {
        return this.get(option) !== undefined;
    }
}

class NavigationOption {
    public name: string;
    public value: string;
    constructor(public parts: string[]) {
        this.name = parts.length > 0 ? parts[0].trim() : '';
        this.value = parts.length > 1 ? parts[1].trim() : '';
    }

    isValid(): boolean {
        return this.name.length > 0 && this.value.length > 0;
    }

    isActive(): boolean {
        return this.value.toLowerCase() === 'true';
    }
}
