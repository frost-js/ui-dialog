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
/**
	* Dialog Class
	* @class
	*/
	var Dialog = class {
		/**
		* New Dialog constructor.
		* @param {object} [options] The options to create the Dialog with.
		*/
		constructor(options = {}) {
			this._options = _fr0st_query.default._extend({}, this.constructor.defaults, options);
			this._render();
			if (this._options.appendTo) _fr0st_query.default.append(this._options.appendTo, this._node);
			else _fr0st_query.default.append(document.body, this._node);
			this._modal = _fr0st_ui.Modal.init(this._node, {
				backdrop: this._options.backdrop,
				show: true
			});
			_fr0st_query.default.addEventOnce(this._node, "hidden.ui.modal", () => {
				_fr0st_query.default.remove(this._node);
				this._node = null;
				this._modal = null;
			});
		}
		/**
		* Close the Dialog.
		*/
		close() {
			this._modal.hide();
		}
	};

//#endregion
//#region src/alert.js
/**
	* Render an alert Dialog.
	* @param {string|Node|Node[]|HTMLElement|DocumentFragment|NodeList|HTMLCollection|QuerySet} [content] The alert content.
	* @param {(() => void)} [callback] The callback to execute when the alert is closed.
	* @param {object} [options] Options for rendering the alert.
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
/**
	* Render a confirm Dialog.
	* @param {string|Node|Node[]|HTMLElement|DocumentFragment|NodeList|HTMLCollection|QuerySet} [content] The confirm dialog content.
	* @param {((result: boolean) => void)} [callback] The callback to execute when the confirm dialog is closed.
	* @param {object} [options] Options for rendering the alert.
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
//#region src/prototype/render.js
/**
	* Render the Modal.
	*/
	function _render() {
		this._node = _fr0st_query.default.create("div", {
			class: this.constructor.classes.modal,
			attributes: {
				"tabindex": -1,
				"role": "dialog",
				"aria-modal": true
			}
		});
		const modalDialog = _fr0st_query.default.create("div", { class: this.constructor.classes.modalDialog });
		switch (this._options.size) {
			case "sm":
				_fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalSm);
				break;
			case "lg":
				_fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalLg);
				break;
			case "xl": _fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalXl);
		}
		if (this._options.centerVertical) _fr0st_query.default.addClass(modalDialog, this.constructor.classes.modalDialogCentered);
		_fr0st_query.default.append(this._node, modalDialog);
		const modalContent = _fr0st_query.default.create("div", { class: this.constructor.classes.modalContent });
		_fr0st_query.default.append(modalDialog, modalContent);
		if (this._options.title || this._options.closeBtn) {
			const modalHeader = _fr0st_query.default.create("div", { class: this.constructor.classes.modalHeader });
			_fr0st_query.default.append(modalContent, modalHeader);
			const modalTitle = _fr0st_query.default.create("h6", {
				class: this.constructor.classes.modalTitle,
				text: this._options.title
			});
			_fr0st_query.default.append(modalHeader, modalTitle);
			if (this._options.closeBtn) {
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
		if (this._options.content) {
			const modalBody = _fr0st_query.default.create("div", { class: this.constructor.classes.modalBody });
			if (_fr0st_query.default._isString(this._options.content)) _fr0st_query.default.setText(modalBody, this._options.content);
			else _fr0st_query.default.append(modalBody, this._options.content);
			_fr0st_query.default.append(modalContent, modalBody);
		}
		if (this._options.buttons.length) {
			const modalFooter = _fr0st_query.default.create("div", { class: this.constructor.classes.modalFooter });
			_fr0st_query.default.append(modalContent, modalFooter);
			for (const buttonData of this._options.buttons) {
				const button = _fr0st_query.default.create("button", {
					class: [this.constructor.classes.btn, buttonData.style],
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

//#endregion
//#region src/index.js
	Dialog.defaults = {
		content: "",
		title: null,
		buttons: [],
		size: null,
		backdrop: "static",
		centerVertical: false,
		closeBtn: true,
		appendTo: null
	};
	Dialog.classes = {
		btn: "btn ripple mb-0",
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
	var proto = Dialog.prototype;
	proto._render = _render;

//#endregion
exports.Dialog = Dialog;
exports.alert = alert;
exports.confirm = confirm;
});
//# sourceMappingURL=frost-ui-dialog.js.map