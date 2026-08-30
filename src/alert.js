/** @import { DialogCallback, DialogContent, DialogOptions } from './dialog.js'; */

import Dialog from './dialog.js';

/**
 * Renders an alert Dialog.
 * @param {DialogContent} [content] The alert content.
 * @param {DialogCallback} [callback] The callback assigned to the default OK action.
 * @param {DialogOptions} [options] Options that override the generated alert options.
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
