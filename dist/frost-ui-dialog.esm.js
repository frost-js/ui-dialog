import $ from "@fr0st/query";
import { Modal, generateId } from "@fr0st/ui";

//#region src/dialog.js
/** @import { NodeInput } from '@fr0st/query/src/helpers.js'; */
/**
* @typedef {NodeInput} DialogContent
*/
/**
* @typedef {'sm'|'lg'|'xl'} DialogSize
*/
/**
* @callback DialogCallback
* @returns {void} Nothing.
*/
/**
* @callback ConfirmCallback
* @param {boolean} result Whether the confirm action was selected.
* @returns {void} Nothing.
*/
/**
* @typedef {object} DialogButton
* @property {string} text The button text.
* @property {string|string[]} [style] The button style classes.
* @property {DialogCallback} [callback] The callback to execute when the button is selected.
*/
/**
* @typedef {object} DialogOptions
* @property {DialogContent} [content=''] The dialog content. Strings are rendered as text.
* @property {string|null} [title=null] The dialog title.
* @property {DialogButton[]} [buttons=[]] The dialog action buttons.
* @property {DialogSize|null} [size=null] The dialog size.
* @property {boolean|'static'} [backdrop='static'] Whether to show a dismissible or static backdrop.
* @property {boolean} [centerVertical=false] Whether to center the dialog vertically.
* @property {boolean} [closeBtn=true] Whether to show a close button.
* @property {NodeInput|null} [appendTo=null] The target to append the dialog to.
* @property {string} [ariaLabel='Dialog'] The accessible label used when there is no title.
*/
/**
* Creates and controls a programmatic Frost UI modal dialog.
*/
var Dialog = class {
	/** @type {Modal|null} */
	#modal;
	/** @type {HTMLElement|null} */
	#node;
	/** @type {Readonly<DialogOptions>|null} */
	#options;
	/**
	* Creates a Dialog.
	* @param {DialogOptions} [options] The Dialog options.
	*/
	constructor(options = {}) {
		this.#options = Object.freeze($._extend({}, this.constructor.defaults, options));
		this.#render();
		if (this.#options.appendTo) $.append(this.#options.appendTo, this.#node);
		else $.append(document.body, this.#node);
		this.#modal = Modal.init(this.#node, {
			backdrop: this.#options.backdrop,
			show: true
		});
		$.addEventOnce(this.#node, "hidden.ui.modal", () => {
			$.remove(this.#node);
			this.#modal = null;
			this.#node = null;
			this.#options = null;
		});
	}
	/**
	* Gets the dialog node.
	* @returns {HTMLElement|null} The dialog node, or `null` after it is hidden.
	*/
	get node() {
		return this.#node;
	}
	/**
	* Gets the resolved dialog options.
	* @returns {Readonly<DialogOptions>|null} The options, or `null` after the dialog is hidden.
	*/
	get options() {
		return this.#options;
	}
	/**
	* Closes the Dialog.
	*/
	close() {
		this.#modal?.hide();
	}
	/**
	* Renders the Dialog.
	*/
	#render() {
		const titleId = this.#options.title ? generateId("ui-dialog-title-") : null;
		const modalAttributes = {
			"aria-hidden": true,
			"role": "dialog",
			"tabindex": -1
		};
		if (titleId) modalAttributes["aria-labelledby"] = titleId;
		else modalAttributes["aria-label"] = this.#options.ariaLabel;
		this.#node = $.create("div", {
			class: this.constructor.classes.modal,
			attributes: modalAttributes
		});
		const modalDialog = $.create("div", { class: this.constructor.classes.modalDialog });
		switch (this.#options.size) {
			case "sm":
				$.addClass(modalDialog, this.constructor.classes.modalSm);
				break;
			case "lg":
				$.addClass(modalDialog, this.constructor.classes.modalLg);
				break;
			case "xl": $.addClass(modalDialog, this.constructor.classes.modalXl);
		}
		if (this.#options.centerVertical) $.addClass(modalDialog, this.constructor.classes.modalDialogCentered);
		$.append(this.#node, modalDialog);
		const modalContent = $.create("div", { class: this.constructor.classes.modalContent });
		$.append(modalDialog, modalContent);
		if (this.#options.title || this.#options.closeBtn) {
			const modalHeader = $.create("div", { class: this.constructor.classes.modalHeader });
			$.append(modalContent, modalHeader);
			if (this.#options.title) {
				const modalTitle = $.create("h2", {
					class: this.constructor.classes.modalTitle,
					text: this.#options.title,
					attributes: { id: titleId }
				});
				$.append(modalHeader, modalTitle);
			}
			if (this.#options.closeBtn) {
				const closeBtn = $.create("button", {
					class: this.constructor.classes.btnClose,
					attributes: {
						"type": "button",
						"aria-label": this.constructor.lang.close
					}
				});
				$.addEvent(closeBtn, "click.ui.dialog", () => {
					this.close();
				});
				$.append(modalHeader, closeBtn);
			}
		}
		if (this.#options.content) {
			const modalBody = $.create("div", { class: this.constructor.classes.modalBody });
			if ($._isString(this.#options.content)) $.setText(modalBody, this.#options.content);
			else $.append(modalBody, this.#options.content);
			$.append(modalContent, modalBody);
		}
		if (this.#options.buttons.length) {
			const modalFooter = $.create("div", { class: this.constructor.classes.modalFooter });
			$.append(modalContent, modalFooter);
			for (const buttonData of this.#options.buttons) {
				const button = $.create("button", {
					class: [this.constructor.classes.btn, buttonData.style].filter(Boolean),
					text: buttonData.text,
					attributes: { type: "button" }
				});
				$.addEvent(button, "click.ui.dialog", () => {
					if (buttonData.callback) buttonData.callback();
					this.close();
				});
				$.append(modalFooter, button);
			}
		}
	}
};

//#endregion
//#region src/alert.js
/** @import { DialogCallback, DialogContent, DialogOptions } from './dialog.js'; */
/**
* Renders an alert Dialog.
* @param {DialogContent} [content] The alert content.
* @param {DialogCallback} [callback] The callback assigned to the default OK action.
* @param {DialogOptions} [options] Options that override the generated alert options.
* @returns {Dialog} The alert Dialog.
*/
function alert(content = "", callback = () => {}, options = {}) {
	return new Dialog({
		content,
		buttons: [{
			text: Dialog.lang.ok,
			style: Dialog.classes.btnPrimary,
			callback
		}],
		...options
	});
}

//#endregion
//#region src/confirm.js
/** @import { ConfirmCallback, DialogContent, DialogOptions } from './dialog.js'; */
/**
* Renders a confirm Dialog.
* @param {DialogContent} [content] The confirm dialog content.
* @param {ConfirmCallback} [callback] The callback assigned to the default Cancel and OK actions.
* @param {DialogOptions} [options] Options that override the generated confirm options.
* @returns {Dialog} The confirm Dialog.
*/
function confirm(content = "", callback = () => {}, options = {}) {
	return new Dialog({
		content,
		buttons: [{
			text: Dialog.lang.cancel,
			style: Dialog.classes.btnSecondary,
			callback: () => callback(false)
		}, {
			text: Dialog.lang.ok,
			style: Dialog.classes.btnPrimary,
			callback: () => callback(true)
		}],
		...options
	});
}

//#endregion
//#region src/index.js
/** @import { DialogOptions } from './dialog.js'; */
/** @type {DialogOptions} */
Dialog.defaults = {
	content: "",
	title: null,
	buttons: [],
	size: null,
	backdrop: "static",
	centerVertical: false,
	closeBtn: true,
	appendTo: null,
	ariaLabel: "Dialog"
};
Dialog.classes = {
	btn: "btn ripple",
	btnClose: "btn-close",
	btnPrimary: "btn-primary",
	btnSecondary: "btn-secondary",
	modal: "modal",
	modalBody: "modal-body",
	modalContent: "modal-content",
	modalDialog: "modal-dialog",
	modalDialogCentered: "modal-dialog-centered",
	modalFooter: "modal-footer",
	modalHeader: "modal-header",
	modalLg: "modal-lg",
	modalSm: "modal-sm",
	modalTitle: "modal-title",
	modalXl: "modal-xl"
};
Dialog.lang = {
	cancel: "Cancel",
	close: "Close",
	ok: "OK"
};

//#endregion
export { Dialog, alert, confirm };
//# sourceMappingURL=frost-ui-dialog.esm.js.map