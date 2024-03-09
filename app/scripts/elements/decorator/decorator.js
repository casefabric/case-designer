const DECORATORFROMBOTTOM = 4;
const DECORATORSIZE = 12;

class Decorator {
    /**
     * Simple helper class to visualize Decorator images on a PlanItem (like AutoComplete, RequiredRule, etc.)
     * @param {DecoratorBox} box 
     * @param {PlanItemView} view 
     * @param {String} imgURL 
     */
    constructor(box, view, imgURL) {
        this.box = box;
        this.view = view;
        this.imgURL = imgURL;
        this.id = Util.createID();
    }

    /**
     * @returns {Boolean}
     */
    get visibility() {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    get tooltip() {
        return '';
    }

    get html() {
        return this.box.html.find('.' + this.id);
    }

    refreshView() {
        const visibility = this.visibility ? 'visible' : 'hidden';
        this.html.attr('visibility', visibility);
        if (this.visibility) {
            this.html.find('.tooltip').html(this.tooltip);
        }
    }

    get markup() {
        const visibility = this.visibility ? 'visible' : 'hidden';
        const i = this.box.decorators.indexOf(this);
        return `
        <image x="${(i * DECORATORSIZE)}" y="${this.box.decoratorsTop}" visibility="${visibility}" width="${DECORATORSIZE}" height="${DECORATORSIZE}" class="${this.id}" xlink:href="${this.imgURL}">
            <title class="tooltip"></title>
        </image>`;
    }
}

class MinusDecorator extends Decorator {
    /**
     * @param {DecoratorBox} box 
     * @param {Stage} view 
     */
    constructor(box, view) {
        super(box, view, MINUS_IMG);
    }

    get visibility() {
        return true;
    }
}

class AutoCompleteDecorator extends Decorator {
    /**
     * @param {StageDecoratorBox} box 
     * @param {Stage} view 
     */
    constructor(box, view) {
        super(box, view, AUTOCOMPLETE_IMG);
        this.view = view;
    }
    
    get tooltip() {
        const type = this.view.planItemDefinition.toString().replace('Definition', '');
        return `${type} will complete when all active items have been completed and no required items are pending`
    }

    get visibility() {
        return this.view.planItemDefinition.autoComplete;
    }
}

class ExpressionDecorator extends Decorator {
    /**
     * @param {DecoratorBox} box 
     * @param {PlanItemView} view 
     */
    constructor(box, view, img, expressionProperty) {
        super(box, view, img);
        this.expressionProperty = expressionProperty;
    }

    get rule() {
        return this.view.definition.itemControl[this.expressionProperty];
    }

    get visibility() {
        return this.rule;
    }

    get tooltip() {
        const rule = this.rule;
        if (! rule) {
            return '';
        }
        // Make rule name uppercase
        const ruleDescription = this.expressionProperty[0].toUpperCase() + this.expressionProperty.slice(1);
        // If no rule body - that's actually an error...
        if (!rule.body) {
            return 'An expression is missing for this ' + ruleDescription;
        }
        const prefix = `${ruleDescription} expression`;
        // Most rules have 'true' as default value, if so, return it in a more concise version
        if (rule.body === 'true') {
            return `${prefix}:\n\t${rule.body}`;
        }
        const headline = `${prefix} (case file context is ${rule.contextName ? rule.contextName :  "not set"}):  \n\n`;
        const spacing = rule.body.length + 2 < headline.length ? '\t' : '';
        // We need to put a dot at the end so that the tooltip takes also some free whitespace after the expression
        //  Perhaps there is some other invisible character that would be a better match ...
        return `${headline}${spacing}${rule.body}\n\n.`;
    }
}

class RequiredRuleDecorator extends ExpressionDecorator {
    /**
     * @param {DecoratorBox} box 
     * @param {PlanItemView} view 
     */
    constructor(box, view) {
        super(box, view, REQUIRED_IMG, 'requiredRule');
    }
}

class RepetitionRuleDecorator extends ExpressionDecorator {
    /**
     * @param {DecoratorBox} box 
     * @param {PlanItemView} view 
     */
    constructor(box, view) {
        super(box, view, REPETITION_IMG, 'repetitionRule');
    }
}

class ManualActivationRuleDecorator extends ExpressionDecorator {
    /**
     * @param {DecoratorBox} box 
     * @param {PlanItemView} view 
     */
    constructor(box, view) {
        super(box, view, MANUALACTIVATION_IMG, 'manualActivationRule');
    }
}
