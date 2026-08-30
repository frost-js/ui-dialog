import Dialog from './dialog.js';

/**
 * Render an alert Dialog.
 * @param {string|Node|Node[]|HTMLElement|DocumentFragment|NodeList|HTMLCollection|QuerySet} [content] The alert content.
 * @param {(() => void)} [callback] The callback to execute when the alert is closed.
 * @param {object} [options] Options for rendering the alert.
 * @returns {Dialog} The alert Dialog.
 */
export function alert(content = '', callback = () => { }, options = {}) {
    return new Dialog({
        content,
        buttons: [
            {
                text: Dialog.lang.ok,
                style: Dialog.classes.btnPrimary,
                callback,
            },
        ],
        ...options,
    });
};
