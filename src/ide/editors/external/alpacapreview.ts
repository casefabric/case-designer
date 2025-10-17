import alpaca_raw_source from "alpaca/dist/alpaca/bootstrap/alpaca.min.js?raw";
import hanldebars_raw_source from "handlebars/dist/handlebars.min.js?raw";
import $ from "jquery";

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
    private html: any; // casting to any because alpaca does not have typescript definitions on jquery elements

    constructor(public container: JQuery<HTMLElement>, public data?: any, public onChange?: (newContent: any) => void) {
        this.html = container;
    }

    render(schema: any) {
        schema.data = this.data;
        schema.postRender = (field: any) => {
            // When the user changes something, update the model
            field.on('change', () => {
                const value = field.getValue();
                if (this.onChange) {
                    this.onChange(value);
                }
            });
        }

        this.html.alpaca(schema);
    }
}
