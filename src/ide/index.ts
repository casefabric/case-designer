import $ from 'jquery';
import IDE from './ide';

// This is a workaround for the jQuery 3.5+ upgrade issue with self-closing tags
// https://github.com/jquery/jquery.com/blob/main/pages/upgrade-guide/3.5.md
// TODO: Remove this workaround when all self-closing tags are fixed in the codebase, 
// those can be found with the following regex: <(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>
const rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;
$.htmlPrefilter = function (html) {
    return html.replace(rxhtmlTag, "<$1></$2>");
};

// Start initialization after the entire page is loaded
window.addEventListener('load', e => new IDE());
