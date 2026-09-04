(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ?  factory(exports, require('@fr0st/query'), require('@fr0st/ui')) :
  typeof define === 'function' && define.amd ? define(['exports', '@fr0st/query', '@fr0st/ui'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.UI = global.UI || {}), global.fQuery,global.UI));
})(this, function(exports, _fr0st_query, _fr0st_ui) {
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
_fr0st_query = __toESM(_fr0st_query, 1);

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
		static classes = {
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
		/** @type {DialogOptions} */
		static defaults = {
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
		static lang = {
			cancel: "Cancel",
			close: "Close",
			ok: "OK"
		};
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
			this.#options = Object.freeze(_fr0st_query.default._extend({}, this.constructor.defaults, options));
			this.#render();
			if (this.#options.appendTo) _fr0st_query.default.append(this.#options.appendTo, this.#node);
			else _fr0st_query.default.append(document.body, this.#node);
			this.#modal = _fr0st_ui.Modal.init(this.#node, {
				backdrop: this.#options.backdrop,
				show: true
			});
			_fr0st_query.default.addEventOnce(this.#node, "hidden.ui.modal", () => {
				_fr0st_query.default.remove(this.#node);
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
			const titleId = this.#options.title ? (0, _fr0st_ui.generateId)("ui-dialog-title-") : null;
			const modalAttributes = {
				"aria-hidden": true,
				"role": "dialog",
				"tabindex": -1
			};
			if (titleId) modalAttributes["aria-labelledby"] = titleId;
			else modalAttributes["aria-label"] = this.#options.ariaLabel;
			this.#node = _fr0st_query.default.create("div", {
				class: this.constructor.classes.modal,
				attributes: modalAttributes
			});
			const modalDialog = _fr0st_query.default.create("div", { class: this.constructor.classes.modalDialog });
			switch (this.#options.size) {
				case "sm":
					_fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalSm);
					break;
				case "lg":
					_fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalLg);
					break;
				case "xl": _fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalXl);
			}
			if (this.#options.centerVertical) _fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalDialogCentered);
			_fr0st_query.default.append(this.#node, modalDialog);
			const modalContent = _fr0st_query.default.create("div", { class: this.constructor.classes.modalContent });
			_fr0st_query.default.append(modalDialog, modalContent);
			if (this.#options.title || this.#options.closeBtn) {
				const modalHeader = _fr0st_query.default.create("div", { class: this.constructor.classes.modalHeader });
				_fr0st_query.default.append(modalContent, modalHeader);
				if (this.#options.title) {
					const modalTitle = _fr0st_query.default.create("h2", {
						class: this.constructor.classes.modalTitle,
						text: this.#options.title,
						attributes: { id: titleId }
					});
					_fr0st_query.default.append(modalHeader, modalTitle);
				}
				if (this.#options.closeBtn) {
					const closeBtn = _fr0st_query.default.create("button", {
						class: this.constructor.classes.btnClose,
						attributes: {
							"type": "button",
							"aria-label": this.constructor.lang.close
						}
					});
					_fr0st_query.default.addEvent(closeBtn, "click.ui.dialog", () => {
						this.close();
					});
					_fr0st_query.default.append(modalHeader, closeBtn);
				}
			}
			if (this.#options.content) {
				const modalBody = _fr0st_query.default.create("div", { class: this.constructor.classes.modalBody });
				if (_fr0st_query.default._isString(this.#options.content)) _fr0st_query.default.setText(modalBody, this.#options.content);
				else _fr0st_query.default.append(modalBody, this.#options.content);
				_fr0st_query.default.append(modalContent, modalBody);
			}
			if (this.#options.buttons.length) {
				const modalFooter = _fr0st_query.default.create("div", { class: this.constructor.classes.modalFooter });
				_fr0st_query.default.append(modalContent, modalFooter);
				for (const buttonData of this.#options.buttons) {
					const button = _fr0st_query.default.create("button", {
						class: [this.constructor.classes.btn, buttonData.style].filter(Boolean),
						text: buttonData.text,
						attributes: { type: "button" }
					});
					_fr0st_query.default.addEvent(button, "click.ui.dialog", () => {
						if (buttonData.callback) buttonData.callback();
						this.close();
					});
					_fr0st_query.default.append(modalFooter, button);
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
exports.Dialog = Dialog;
exports.alert = alert;
exports.confirm = confirm;
});
//# sourceMappingURL=frost-ui-dialog.js.map