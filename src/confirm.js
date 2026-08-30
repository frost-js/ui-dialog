/** @import { ConfirmCallback, DialogContent, DialogOptions } from './dialog.js'; */

import Dialog from './dialog.js';

/**
 * Renders a confirm Dialog.
 * @param {DialogContent} [content] The confirm dialog content.
 * @param {ConfirmCallback} [callback] The callback assigned to the default Cancel and OK actions.
 * @param {DialogOptions} [options] Options that override the generated confirm options.
 * @returns {Dialog} The confirm Dialog.
 */
export function confirm(content = '', callback = () => { }, options = {}) {
    return new Dialog({
        content,
        buttons: [
            {
                text: Dialog.lang.cancel,
                style: Dialog.classes.btnSecondary,
                callback: () => callback(false),
            },
            {
                text: Dialog.lang.ok,
                style: Dialog.classes.btnPrimary,
                callback: () => callback(true),
            },
        ],
        ...options,
    });
};
