/** @import { DialogOptions } from './dialog.js'; */

import { alert } from './alert.js';
import { confirm } from './confirm.js';
import Dialog from './dialog.js';

/** @type {DialogOptions} */
Dialog.defaults = {
    content: '',
    title: null,
    buttons: [],
    size: null,
    backdrop: 'static',
    centerVertical: false,
    closeBtn: true,
    appendTo: null,
    ariaLabel: 'Dialog',
};

Dialog.classes = {
    btn: 'btn ripple',
    btnClose: 'btn-close',
    btnPrimary: 'btn-primary',
    btnSecondary: 'btn-secondary',
    modal: 'modal',
    modalBody: 'modal-body',
    modalContent: 'modal-content',
    modalDialog: 'modal-dialog',
    modalDialogCentered: 'modal-dialog-centered',
    modalFooter: 'modal-footer',
    modalHeader: 'modal-header',
    modalLg: 'modal-lg',
    modalSm: 'modal-sm',
    modalTitle: 'modal-title',
    modalXl: 'modal-xl',
};

Dialog.lang = {
    cancel: 'Cancel',
    close: 'Close',
    ok: 'OK',
};

export {
    alert,
    confirm,
    Dialog,
};
