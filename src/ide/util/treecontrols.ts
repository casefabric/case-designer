import $ from "jquery";
import Images from "./images/images";

export const parentBranchIdAttribute = 'data-treecontrols-parentid';
export const branchIdAttribute = 'data-treecontrols-id';
export const collapsedClass = 'treecontrols-collapsed';
export const expandedClass = 'treecontrols-expanded';
export const expanderClass = 'treecontrols-expander';

export default function treecontrols(table: JQuery<HTMLElement>): void {
    const rows = table.find(`[${parentBranchIdAttribute}]`);

    rows.each(function (index, row) {
        const
            $row = $(row),
            id = $row.data('treecontrols-id'),
            children = table.find(`[${parentBranchIdAttribute}="${id}"]`);

        if (children.length) {
            $row.prepend(
                `<span class="${expanderClass} ${collapsedClass}">
                    <img src="${Images.BranchExpand}"/>
                </span>`);

            children.hide();

            $row.on('click', function (e) {
                const $target = $(e.target).closest(`[${parentBranchIdAttribute}]`).find(`.${expanderClass}`);

                if ($target.hasClass(collapsedClass)) {
                    $target
                        .removeClass(collapsedClass)
                        .addClass(expandedClass);
                    $target.find('img').attr('src', Images.BranchCollapse);

                    children.show();
                } else {
                    $target
                        .removeClass(expandedClass)
                        .addClass(collapsedClass);
                    $target.find('img').attr('src', Images.BranchExpand);
                    reverseHide(table, row);
                }
            });
        }
    });
}

// Reverse hide all elements
function reverseHide(table: JQuery<HTMLElement>, element: HTMLElement) {
    const
        $element = $(element),
        id: string = $element.data('treecontrols-id'),
        children = table.find(`[${parentBranchIdAttribute}="${id}"]`);

    if (id === undefined) {
        return;
    }

    children.each((_, element) => reverseHide(table, element));
    children.hide();

    $element
        .find(expandedClass)
        .removeClass(expandedClass)
        .addClass(collapsedClass);
}

