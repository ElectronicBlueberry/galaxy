export function selectAllText(element: HTMLElement) {
    element.focus();

    if (element instanceof HTMLTextAreaElement) {
        element.select();
    } else {
        const range = document.createRange();
        range.selectNode(element);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
    }
}
