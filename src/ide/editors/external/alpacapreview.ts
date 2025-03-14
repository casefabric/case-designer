import alpaca_raw_source from "alpaca/dist/alpaca/bootstrap/alpaca.min.js?raw";
import hanldebars_raw_source from "handlebars/dist/handlebars.min.js?raw";
import $ from "jquery";

// BIG TODO HERE Alpaca doesn't work with jQuery import .  Some undefined jQuery
// import "handlebars";
// import "alpaca/dist/alpaca/bootstrap/alpaca";

function loadScriptSync(src: string) {
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.async = false;                                 // <-- this is important
    var sourceCodeNode = document.createTextNode(src);
    s.appendChild(sourceCodeNode);
    document.getElementsByTagName('head')[0].appendChild(s);
}

(<any>window).jQuery = $;
loadScriptSync(hanldebars_raw_source);
loadScriptSync(alpaca_raw_source);

export default class AlpacaPreview {
    html: JQuery<HTMLElement>;

    constructor(public container: JQuery<HTMLElement>) {
        this.html = container;
    }

    render(jsonForm: any) {
        (<any>this.html)?.alpaca(jsonForm);
    }
}
