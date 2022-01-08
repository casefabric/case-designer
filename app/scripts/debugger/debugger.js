'use strict';

/**
 * This class implements the logic to call the repository REST service to debug a case instance.
 *
 * @constructor
 */
class Debugger extends StandardForm {
    /**
     * 
     * @param {CaseModelEditor} editor 
     */
    constructor(editor) {
        super(editor, 'Debugger', 'debug-form');
        this.eventTypeFilter = '';
        this.eventNameFilter = '';
    }

    renderData() {
        this.htmlContainer.html(
`<div>
    <div>
        <span style="top:-15px;position:relative;">
            <label>Case instance</label>
            <input class="caseInstanceId" type="text"></input>
            <button class="buttonShowEvents">Show Events</button>
        </span>
        <span style="left:450px;top:-35px;font-size:smaller;position:relative;">
            <table>
                <tr>
                    <td>
                        <label style="margin-right:10px;">Event Range (from/to)</label>
                    </td>
                    <td>
                        <label style="margin-left:15px">Show/hide options</label>
                    </td>
                </tr>
                <tr>
                    <td>
                        <input class="from" type="number" style="margin-left:5px;font-size:smaller;width:50px;position:relative;top:-1px;"></input>
                    </td>
                    <td>
                        <input style="margin-left:15px;position:relative;top:1px" id="ht" class="inputShowAllTimestamps" type="checkbox"></input>
                        <label style="position:relative;top:-2px" for="ht">All timestamps</label>
                    </td>
                </tr>
                <tr>
                    <td>
                        <input class="to" type="number" style="margin-left:5px;font-size:smaller;width:50px;position:relative;top:-1px;"></input>
                    </td>
                    <td>        
                        <input style="margin-left:15px" id="hd" class="inputHideDetails" type="checkbox"></input>
                        <label style="position:relative;top:-3px" for="hd">Hide generic event data</label>
                    </td>
                </tr>
            </table>
        </span>
    </div>
    <div class="event-container">
        <div>
            <span class="spanEventListButtons">
                <label>Events</label>
                <button class="buttonCopyEvents">Copy events</button>
                <button class="buttonCopyDefinition">Copy case definition</button>            
                <button class="buttonShowParentEvents">Show Parent Events</button>
                <button class="buttonCopyFilteredEvents">Copy filtered events</button>
            </span>
        </div>
        <div class="debug-container">
            <div class="event-list">
                <table>
                    <tr>
                        <td><strong>Nr</strong></td>
                        <td><strong>Type</strong></td>
                        <td><strong>Time</strong></td>
                    </tr>
                </table>
            </div>
            <div class="event-content">
                <div class="codeMirrorSource debugFormContent" />
            </div>
        </div>
    </div>
</div>`);

        this.html.find('.caseInstanceId').val(localStorage.getItem('debug-case-id'))
        this.html.find('.from').val(localStorage.getItem('from'))
        this.html.find('.to').val(localStorage.getItem('to'))
        this.login = JSON.parse(localStorage.getItem('login') || '{}')
        this.html.find('.inputHideDetails').prop('checked', this.hideDetails);
        this.html.find('.inputHideDetails').on('change', e => this.hideDetails = e.currentTarget.checked);
        this.html.find('.inputShowAllTimestamps').prop('checked', this.showAllTimestamps);
        this.html.find('.inputShowAllTimestamps').on('change', e => {
            this.showAllTimestamps = e.currentTarget.checked;
            this.renderEvents();
        });
        this.html.find('.buttonShowEvents').on('click', () => this.showEvents());
        this.html.find('.buttonShowParentEvents').on('click', () => this.showParentEvents());
        this.html.find('.buttonCopyEvents').on('click', () => Util.copyText(JSON.stringify(this.events, undefined, 2)));
        this.html.find('.buttonCopyFilteredEvents').on('click', () => Util.copyText(JSON.stringify(this.eventSelection, undefined, 2)));
        this.html.find('.buttonCopyDefinition').on('click', () => Util.copyText(this.currentDefinition));

        this.splitter = new RightSplitter(this.html.find('.debug-container'), '150px');
        this.eventTable = this.html.find('.event-list');

        // Add code mirror for decent printing
        this.codeMirrorEventViewer = CodeMirrorConfig.createJSONEditor(this.htmlContainer.find('.debugFormContent'));

        this.keyHandler = e => this.handleKeyDown(e);

        // Scan for pasted text. It can upload and re-engineer a deployed model into a set of files
        this.html.find('.event-content').on('paste', e => this.handlePasteText(e));
    }

    /**
     * 
     * @param {JQuery.Event} e 
     */
    handlePasteText(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        const pastedText = e.originalEvent.clipboardData.getData('text/plain');
        try {
            const potentialEvents = JSON.parse(pastedText);
            this.events = potentialEvents;
        } catch (error) {
            console.log("Cannot paste text events")
            return false;
        }
    }

    /**
     * 
     * @param {JQuery.ChangeEvent} e 
     */
    searchWith(e) {
        const searchBox = $(e.currentTarget);
        const searchText = searchBox.val();
        const filterName = searchBox.attr('filter');
        this[filterName] = searchText;
        this.renderEvents();
    }

    /**
     * Determines recursively whether each character of text1 is available in text2
     * @param {String} searchFor 
     * @param {String} searchIn 
     */
    hasSearchText(searchFor, searchIn) {
        if (!searchFor) { // Nothing left to search for, so found a hit
            return true;
        }
        if (!searchIn) { // Nothing left to search in, so did not find it.
            return false;
        }
        searchFor = searchFor.toLowerCase();
        searchIn = searchIn.toLowerCase();
        const index = searchIn.indexOf(searchFor.charAt(0));
        if (index < 0) { // Did not find any results, so returning false.
            return false;
        }
        // Continue the search in the remaining parts of text2
        const remainingText2 = searchIn.substring(index + 1, searchIn.length);
        const remainingText1 = searchFor.substring(1);
        return this.hasSearchText(remainingText1, remainingText2);
    }    

    /**
     * @returns {Boolean}
     */
    get hideDetails() {
        const hide = localStorage.getItem('hideDetails') === 'true';
        return hide;
    }

    set hideDetails(show) {
        localStorage.setItem('hideDetails', show.toString());
    }

    /**
     * @returns {Boolean}
     */
    get showAllTimestamps() {
        const hide = localStorage.getItem('hideTimestamps') === 'true';
        return hide;
    }

    set showAllTimestamps(show) {
        localStorage.setItem('hideTimestamps', show.toString());
    }

    /**
     * 
     * @param {JQuery.KeyDownEvent} e 
     */
    handleKeyDown(e) {
        if (e.keyCode == 38) { // arrow up
            if (this.selectedEventId) {
                if (this.selectedEventId == this.events.length) {
                    // console.log("At the beginning of the table")
                    return;
                }
                const tr = this.eventTable.find(`tr[event-nr='${this.selectedEventId}']`);
                if (tr.length) {
                    // console.log("Keying up one");
                    this.selectEvent(tr[0].previousElementSibling)
                } else {

                }
            } else {
                const lastEvent = this.events.length;
                if (lastEvent) { // If there are events, select the last one (because table is showing reversed list)
                    this.selectEvent(this.eventTable.find(`tr[event-nr='${lastEvent}']`)[0])
                }
            }
        } else if (e.keyCode == 40) { // arrow down
            if (this.selectedEventId) {
                if (this.selectedEventId == 0) {
                    // console.log("At the end of the table")
                    return;
                }
                const tr = this.eventTable.find(`tr[event-nr='${this.selectedEventId}']`);
                if (tr.length) {
                    // console.log("Keying down one");
                    this.selectEvent(tr[0].nextElementSibling);
                }
            } else {
                const lastEvent = this.events.length;
                if (lastEvent) { // If there are events, select the last one (because table is showing reversed list)
                    this.selectEvent(this.eventTable.find(`tr[event-nr='${lastEvent - 1}']`)[0])
                }
            }
        }
    }

    move() {
        // CaseModelEditor moves the movable editor upon keypress (up/down). But we want to use that keypress ourselves, hence ignore the casemodeleditor with this override
        // console.log("Ignoring the move ;)")
    }

    onShow() {
        this.html.css('height', '100%');
        this.html.css('width', '100%');
        this.html.css('top', '0px');
        this.html.css('left', '0px');

        $(document).off('keyup', this.keyHandler);
        $(document).on('keyup', this.keyHandler);
        this.html.find('.buttonShowEvents').focus();
    }

    onHide() {
        $(document).off('keyup', this.keyHandler);
        this.selectedEventId = undefined;
    }

    setEventContent(label, content) {
        this.codeMirrorEventViewer.setValue(content);
        this.codeMirrorEventViewer.refresh();
    }

    get events() {
        return this._events;
    }

    /**
     * @param {Array<*>} events 
     */
    set events(events) {
        this._events = events;
        for (let i = 0; i< events.length; i++) {
            events[i].localNr = i;
        }
        this.currentDefinition = ''; // Clear current case definition
        this.events.filter(event => event.type === 'CaseDefinitionApplied').forEach(event => this.currentDefinition = event.content.definition.source);
        this.parentActorId = '';
        this.events.filter(event => event.content.parentActorId).map(event => this.parentActorId = event.content.parentActorId);
        this.pics = events.filter(event => event.type === 'PlanItemCreated');
        console.log(`Found ${events.length} events`)
        this.renderEvents();

        const picPrinter = (pic, index) => {
            return `${index}: ${pic.content.type}[${pic.content.name + '.' + pic.content.planitem.index}]`;
        }
        if (this.pics.length > 0) { // Otherwise probably a tenant is rendered
            console.log(`Case has ${this.pics.length} plan items:\n ${this.pics.map(picPrinter).join('\n ')}`);
        }
    }

    getEventName(event) {
        const planItemId = event.content.planItemId || event.content.taskId;
        if (!planItemId) return '';
        // console.log("Searching for event with id "+planItemId)
        const eventWithName = this.getPlanItemName(planItemId);
        const eventIndex = this.getIndex(eventWithName);
        // console.log("Event with name: "+(eventWithName ? (eventWithName.content.name) : 'none'));
        return eventWithName;
    }

    getEventButton(event) {
        if (event.type==='TaskInputFilled' && (event.content.type === 'ProcessTask' || event.content.type === 'CaseTask')) {
            return '<span style="padding-left:20px"><button class="buttonShowSubEvents">Show events</button></span>'
        } else {
            return '';
        }
    }

    getPlanItemName(planItemId) {
        const pic = this.pics.find(p => p.content.planItemId === planItemId);
        if (pic) {
            return pic.content.name + '.' + pic.content.planitem.index;
        } else {
            return '';
        }

    }

    getIndex(eventWithName) {
        if (! eventWithName) return '';
        if (! eventWithName.content) return '';
        if (! eventWithName.content.planitem) return '';
        const index = eventWithName.content.planitem.index;
        if (index) {
            return '.' + index;
        } else {
            return '.0';
        }
    }

    renderEvents() {
        if (! this.events) {
            return;
        }
        const renderedBefore = this.eventTable.find('tr').length > 1;
        const startMsg = this.events.length > 0 ? '' : 'If there are no events, check case instance id and context variables';
        this.setEventContent('', startMsg);
        Util.clearHTML(this.eventTable);

        const getBackgroundColor = event => {
            if (event.type !== 'PlanItemTransitioned') return '';
            if (event.content.currentState == 'Failed') return 'color: red; font-weight: bold';
            if (event.content.currentState == 'Completed') return 'color: green; font-weight: bold';
            if (event.content.currentState == 'Terminated') return 'color: darkblue; font-weight: bold';
        }

        const eventTypes = this.eventTypeFilter.split(' ');
        const eventNames = this.eventNameFilter.split(' ');

        const applyFilter = event => {
            const eventType = event.type;
            const eventName = this.getEventName(event);
            const hasOneOfEventTypes = eventTypes[0] == '' || eventTypes.find(type => this.hasSearchText(type, eventType));
            const hasOneOfEventNames = eventNames[0] == '' || eventNames.find(name => this.hasSearchText(name, eventName));
            return hasOneOfEventTypes && hasOneOfEventNames;
        }

        let currentTimestamp = '';
        let numTransactions = 0;

        this.eventSelection = this.events.filter(applyFilter);
        const newRows = this.eventSelection.map(event => {
            const timestamp = event.content.modelEvent.timestamp ? event.content.modelEvent.timestamp : event.type.indexOf('Modified') >=0 ? event.content.lastModified : '';
            const format = timestamp => timestamp.substring(0, timestamp.indexOf('.') + 4);
            let timestampString = timestamp;
            if (! currentTimestamp) { // bootstrap
                currentTimestamp = timestamp;
                numTransactions = 1;
                timestampString = `<strong>${format(timestamp)}</strong>`;
            }
            if (currentTimestamp != timestamp) {
                currentTimestamp = timestamp;
                numTransactions++;
                timestampString = `<strong>${format(timestamp)}</strong>`;
            } else {
                timestampString = this.showAllTimestamps ? format(timestamp) : '';
            }
            const bgc = getBackgroundColor(event);
            return `<tr event-nr="${event.localNr}">
                <td>${event.nr}</td>
                <td style="${bgc}">${event.type}${this.getEventButton(event)}</td>
                <td style="white-space:nowrap"><span>${this.getEventName(event)}</span></td>
                <td style="white-space:nowrap">${timestampString}</td>
            </tr>\n`
        }).reverse().join('');
        this.eventTable.html(`
        <table>
            <thead>
                <tr>
                    <td><strong>Nr</strong><br/><div>count: ${this.eventSelection.length}</div></td>
                    <td><strong>Type</strong><br/><input type="text"  filter="eventTypeFilter" value="${this.eventTypeFilter}" /></td>
                    <td style="white-space:nowrap"><strong>Name</strong><br/><input type="text" filter="eventNameFilter" value="${this.eventNameFilter}" /></td>
                    <td style="white-space:nowrap"><strong>Time</strong><div>batches: ${numTransactions}</div></td>
                </tr>
            </thead>
            <tbody>
                ${newRows}
            </tbody>
        </table>`);
        this.eventTable.find('tr').on('click', e => this.selectEvent(e.currentTarget));
        this.eventTable.find('input[filter]').on('change', e => this.searchWith(e));
        this.eventTable.find('.buttonShowSubEvents').on('click', e => this.showSubEvents(e.currentTarget));

        if (this.eventTable.width() < this.eventTable.find('table').width()) {
            this.splitter.repositionSplitter(this.eventTable.find('table').width() + 20);
        }
        if (!renderedBefore) this.splitter.repositionSplitter(this.eventTable.find('table').width() + 70);
        this.renderEventButtons();
    }

    renderEventButtons() {
        if (this.events && this.events.length > 0) {
            this.html.find('.spanEventListButtons').css('display', 'block');
            this.html.find('.buttonCopyDefinition').css('display', this.currentDefinition ? '' : 'none');
            this.html.find('.buttonCopyFilteredEvents').css('display', this.events.length == this.eventSelection.length ? 'none' : '');
            this.html.find('.buttonShowParentEvents').css('display', this.parentActorId ? '' : 'none');
        } else {
            this.html.find('.spanEventListButtons').css('display', 'none');
        }
    }

    get selectedEventId() {
        return this._evtId;
    }

    set selectedEventId(id) {
        this._evtId = id;
    }


    /**
     * @param {Element} htmlElement
     */
    findEvent(htmlElement) {
        const eventId = $(htmlElement).closest('tr').attr('event-nr');
        if (eventId) {
            const event = this.events[eventId];
            return event;
        }
    }

    showSubEvents(btn) {
        const event = this.findEvent(btn);
        this.html.find('.caseInstanceId').val(event.content.taskId);
        this.showEvents();
    }

    showParentEvents() {
        if (this.parentActorId) {
            this.html.find('.caseInstanceId').val(this.parentActorId);
            this.showEvents();
        }
    }

    /**
     * @param {Element} tr
     */
    selectEvent(tr) {
        const event = this.findEvent(tr);
        if (event) {
            this.selectedEventId = event.localNr;
            if (event.type === 'CaseDefinitionApplied') {
                console.group('CaseDefinition');
                console.log(event.content.definition.source);
                console.groupEnd();
            }
            this.eventTable.find('tr').css('background-color', '')
            $(tr).css('background-color', 'rgb(156, 175, 226)');
            const content = JSON.parse(JSON.stringify(event.content));
            if (this.hideDetails) {
                delete content.modelEvent;
                delete content.caseInstanceId;
            }
            this.setEventContent('', JSON.stringify(content, undefined, 3));
        }
    }

    showEvents() {
        const caseInstanceId = this.html.find('.caseInstanceId').val();
        const from = this.html.find('.from').val();
        const to = this.html.find('.to').val();
        const parameters = [];
        if (from && from !== '') {
            parameters.push(`from=${from}`)
        }
        if (to) {
            parameters.push(`to=${to}`)
        }

        $.get(`/repository/api/events/${caseInstanceId}?${parameters.join('&')}`)
            .done(data => {
                this.events = data;
                localStorage.setItem('debug-case-id', caseInstanceId.toString());
                localStorage.setItem('from', ''+from);
                localStorage.setItem('to', ''+to);
            })
            .fail(data => ide.danger(data.responseText));
    }
}