/** @import { Page } from '@playwright/test'; */

/**
 * Reset the browser page and Dialog configuration.
 * @param {Page} page The Playwright page.
 * @returns {Promise<void>} The promise.
 */
export async function resetPage(page) {
    await page.goto('/', {
        waitUntil: 'domcontentloaded',
    });

    const stateReset = await page.evaluate((_) => {
        if (
            !window.fQuery ||
            !window.UI?.Dialog ||
            typeof window.UI.alert !== 'function' ||
            typeof window.UI.confirm !== 'function'
        ) {
            return false;
        }

        window.$ = window.fQuery;

        UI.Dialog.defaults.content = '';
        UI.Dialog.defaults.title = null;
        UI.Dialog.defaults.buttons = [];
        UI.Dialog.defaults.size = null;
        UI.Dialog.defaults.backdrop = 'static';
        UI.Dialog.defaults.centerVertical = false;
        UI.Dialog.defaults.closeBtn = true;
        UI.Dialog.defaults.appendTo = null;
        UI.Dialog.defaults.ariaLabel = 'Dialog';

        UI.Dialog.classes.btn = 'btn ripple';
        UI.Dialog.classes.btnClose = 'btn-close';
        UI.Dialog.classes.btnPrimary = 'btn-primary';
        UI.Dialog.classes.btnSecondary = 'btn-secondary';
        UI.Dialog.classes.modal = 'modal';
        UI.Dialog.classes.modalBody = 'modal-body';
        UI.Dialog.classes.modalContent = 'modal-content';
        UI.Dialog.classes.modalDialog = 'modal-dialog';
        UI.Dialog.classes.modalDialogCentered = 'modal-dialog-centered';
        UI.Dialog.classes.modalFooter = 'modal-footer';
        UI.Dialog.classes.modalHeader = 'modal-header';
        UI.Dialog.classes.modalLg = 'modal-lg';
        UI.Dialog.classes.modalSm = 'modal-sm';
        UI.Dialog.classes.modalTitle = 'modal-title';
        UI.Dialog.classes.modalXl = 'modal-xl';

        UI.Dialog.lang.cancel = 'Cancel';
        UI.Dialog.lang.close = 'Close';
        UI.Dialog.lang.ok = 'OK';

        $.empty(document.body);

        return window.$ === window.fQuery &&
            typeof UI.Modal === 'function';
    });

    if (!stateReset) {
        throw new Error('Failed to restore Dialog on the test page.');
    }

    await page.waitForFunction((_) => {
        const test = $.create('div', { class: 'modal-dialog modal-dialog-centered' });
        $.append(document.body, test);
        const ready = $.css(test, 'align-items') === 'center';
        $.remove(test);
        return ready;
    });
}
