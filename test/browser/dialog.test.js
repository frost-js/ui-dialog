import { expect, test } from '#test';
import { resetPage } from '../setup/browser.js';

test.beforeEach(async ({ page }) => {
    await resetPage(page);
});

test.describe('Dialog', () => {
    test.describe('#constructor', () => {
        test('creates a Dialog', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const dialog = new UI.Dialog();
                return dialog instanceof UI.Dialog;
            })).toBe(true);
        });

        test('exposes frozen default options', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const dialog = new UI.Dialog();
                return {
                    appendTo: dialog.options.appendTo,
                    ariaLabel: dialog.options.ariaLabel,
                    backdrop: dialog.options.backdrop,
                    buttons: dialog.options.buttons,
                    centerVertical: dialog.options.centerVertical,
                    closeBtn: dialog.options.closeBtn,
                    content: dialog.options.content,
                    frozen: Object.isFrozen(dialog.options),
                    size: dialog.options.size,
                    title: dialog.options.title,
                };
            })).toEqual({
                appendTo: null,
                ariaLabel: 'Dialog',
                backdrop: 'static',
                buttons: [],
                centerVertical: false,
                closeBtn: true,
                content: '',
                frozen: true,
                size: null,
                title: null,
            });
        });

        test('isolates resolved options from input and other dialogs', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const options = { title: 'First' };
                const first = new UI.Dialog(options);
                options.title = 'Changed';
                const second = new UI.Dialog({ title: 'Second' });

                return {
                    different: first.options !== second.options,
                    first: first.options.title,
                    second: second.options.title,
                };
            })).toEqual({
                different: true,
                first: 'First',
                second: 'Second',
            });
        });

        test('renders the dialog structure', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({
                    buttons: [{ text: 'Save' }],
                    content: 'Dialog content',
                    title: 'Dialog title',
                });
            });

            const modal = page.locator('.modal');

            await expect(modal).toHaveAttribute('role', 'dialog');
            await expect(modal).toHaveAttribute('tabindex', '-1');
            await expect(modal.locator('.modal-dialog')).toHaveCount(1);
            await expect(modal.locator('.modal-content')).toHaveCount(1);
            await expect(modal.locator('.modal-header')).toHaveCount(1);
            await expect(modal.locator('.modal-title')).toHaveText('Dialog title');
            await expect(modal.locator('.btn-close')).toHaveAttribute('aria-label', 'Close');
            await expect(modal.locator('.modal-body')).toHaveText('Dialog content');
            await expect(modal.locator('.modal-footer')).toHaveCount(1);
            await expect(modal.locator('.modal-footer button')).toHaveText('Save');
            await expect(modal.locator('.modal-footer button')).not.toHaveClass(/\bmb-0\b/);
        });

        test('starts hidden and allows Modal to manage ARIA state', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const dialog = new UI.Dialog({ title: 'Dialog title' });
                return {
                    ariaHidden: $.getAttribute(dialog.node, 'aria-hidden'),
                    ariaModal: $.getAttribute(dialog.node, 'aria-modal'),
                };
            })).toEqual({
                ariaHidden: 'true',
                ariaModal: null,
            });

            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');
            await expect(page.locator('.modal')).toHaveAttribute('aria-modal', 'true');
        });

        test('associates the title with the dialog', async ({ page }) => {
            const result = await page.evaluate((_) => {
                const dialog = new UI.Dialog({ title: 'Dialog title' });
                const title = $.findOne('.modal-title', dialog.node);
                return {
                    label: $.getAttribute(dialog.node, 'aria-label'),
                    labelledBy: $.getAttribute(dialog.node, 'aria-labelledby'),
                    titleId: $.getAttribute(title, 'id'),
                    titleTag: title.tagName,
                };
            });

            expect(result).toEqual({
                label: null,
                labelledBy: result.titleId,
                titleId: result.titleId,
                titleTag: 'H2',
            });
            expect(result.titleId).toMatch(/^ui-dialog-title-/);
        });
    });

    test.describe('#close', () => {
        test('closes the Dialog', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialog = new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.dialog.close();
            });

            await expect(page.locator('.modal')).toHaveCount(0);
            await expect(page.locator('.modal-backdrop')).toHaveCount(0);
            await expect(page.locator('body')).not.toHaveClass(/\bmodal-open\b/);
        });

        test('can be called multiple times', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialog = new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.dialog.close();
                window.dialog.close();
                window.dialog.close();
            });

            await expect(page.locator('.modal')).toHaveCount(0);
        });

        test('can be called after cleanup', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialog = new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.dialog.close();
            });
            await expect(page.locator('.modal')).toHaveCount(0);

            expect(await page.evaluate((_) => {
                try {
                    window.dialog.close();
                    return true;
                } catch {
                    return false;
                }
            })).toBe(true);
        });

        test('clears the public state after cleanup', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialog = new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.dialog.close();
            });
            await expect(page.locator('.modal')).toHaveCount(0);

            expect(await page.evaluate((_) => ({
                node: window.dialog.node,
                options: window.dialog.options,
            }))).toEqual({
                node: null,
                options: null,
            });
        });
    });

    test.describe('content option', () => {
        test('renders string content as text', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ content: '<strong>Text</strong>' });
            });

            await expect(page.locator('.modal-body')).toHaveText('<strong>Text</strong>');
            await expect(page.locator('.modal-body strong')).toHaveCount(0);
        });

        test('appends DOM content', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const content = $.create('span', { text: 'DOM content' });
                const dialog = new UI.Dialog({ content });
                return $.findOne('.modal-body span', dialog.node) === content;
            })).toBe(true);
        });

        test('appends QuerySet content', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const first = $.create('span', { text: 'First' });
                const second = $.create('span', { text: 'Second' });
                const dialog = new UI.Dialog({ content: $([first, second]) });
                const children = $.find('.modal-body span', dialog.node);
                return children[0] === first && children[1] === second;
            })).toBe(true);
        });

        test('does not render an empty body', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });

            await expect(page.locator('.modal-body')).toHaveCount(0);
        });
    });

    test.describe('title and ariaLabel options', () => {
        test('renders a title', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ title: 'Dialog title' });
            });

            await expect(page.locator('.modal-title')).toHaveText('Dialog title');
            await expect(page.locator('.modal')).not.toHaveAttribute('aria-label');
        });

        test('uses ariaLabel when the title is empty', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({
                    ariaLabel: 'Session expired',
                    closeBtn: false,
                });
            });

            await expect(page.locator('.modal')).toHaveAttribute('aria-label', 'Session expired');
            await expect(page.locator('.modal')).not.toHaveAttribute('aria-labelledby');
            await expect(page.locator('.modal-header')).toHaveCount(0);
        });
    });

    test.describe('closeBtn option', () => {
        test('renders a close button by default', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });

            await expect(page.locator('.btn-close')).toHaveCount(1);
        });

        test('does not render a close button when disabled', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ closeBtn: false });
            });

            await expect(page.locator('.btn-close')).toHaveCount(0);
            await expect(page.locator('.modal-header')).toHaveCount(0);
        });

        test('closes the Dialog when selected', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.locator('.btn-close').click();

            await expect(page.locator('.modal')).toHaveCount(0);
        });
    });

    test.describe('buttons option', () => {
        test('renders custom buttons', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({
                    buttons: [
                        {
                            style: ['btn-danger', 'custom-action'],
                            text: 'Delete',
                        },
                        { text: 'Cancel' },
                    ],
                });
            });

            const buttons = page.locator('.modal-footer button');

            await expect(buttons).toHaveCount(2);
            await expect(buttons).toHaveText(['Delete', 'Cancel']);
            await expect(buttons.first()).toHaveClass(/\bbtn-danger\b/);
            await expect(buttons.first()).toHaveClass(/\bcustom-action\b/);
            await expect(buttons.nth(1)).toHaveClass(/\bbtn\b/);
        });

        test('runs a custom callback and closes the Dialog', async ({ page }) => {
            await page.evaluate((_) => {
                window.callbackCount = 0;
                new UI.Dialog({
                    buttons: [
                        {
                            callback: () => {
                                window.callbackCount++;
                            },
                            text: 'Save',
                        },
                    ],
                });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.getByRole('button', { name: 'Save' }).click();

            await expect(page.locator('.modal')).toHaveCount(0);
            expect(await page.evaluate((_) => window.callbackCount)).toBe(1);
        });

        test('closes without a callback', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ buttons: [{ text: 'Done' }] });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.getByRole('button', { name: 'Done' }).click();

            await expect(page.locator('.modal')).toHaveCount(0);
        });

        test('does not render an empty footer', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });

            await expect(page.locator('.modal-footer')).toHaveCount(0);
        });
    });

    test.describe('size option', () => {
        test('renders supported dialog sizes', async ({ page }) => {
            expect(await page.evaluate((_) => ['sm', 'lg', 'xl'].map((size) => {
                const dialog = new UI.Dialog({ size });
                return $.getAttribute($.findOne('.modal-dialog', dialog.node), 'class');
            }))).toEqual([
                'modal-dialog modal-sm',
                'modal-dialog modal-lg',
                'modal-dialog modal-xl',
            ]);
        });

        test('renders the default dialog size', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });

            await expect(page.locator('.modal-dialog')).toHaveClass('modal-dialog');
        });
    });

    test.describe('centerVertical option', () => {
        test('centers the Dialog vertically', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ centerVertical: true });
            });

            await expect(page.locator('.modal-dialog')).toHaveClass(/\bmodal-dialog-centered\b/);
        });
    });

    test.describe('appendTo option', () => {
        test('appends to the document body by default', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const dialog = new UI.Dialog();
                return dialog.node.parentElement === document.body;
            })).toBe(true);
        });

        test('appends to a custom QuerySet target', async ({ page }) => {
            expect(await page.evaluate((_) => {
                $.setHTML(document.body, '<section id="dialog-host"></section>');
                const dialog = new UI.Dialog({ appendTo: $('#dialog-host') });
                return dialog.node.parentElement === $.findOne('#dialog-host');
            })).toBe(true);
        });
    });

    test.describe('backdrop option', () => {
        test('uses a static backdrop by default', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.locator('.modal').click({ position: { x: 1, y: 1 } });

            await expect(page.locator('.modal')).toHaveClass(/\bshow\b/);
            await expect(page.locator('.modal-backdrop')).toHaveCount(1);
        });

        test('dismisses with a dismissible backdrop', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ backdrop: true });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.locator('.modal').click({ position: { x: 1, y: 1 } });

            await expect(page.locator('.modal')).toHaveCount(0);
            await expect(page.locator('.modal-backdrop')).toHaveCount(0);
        });

        test('renders without a backdrop', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ backdrop: false });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await expect(page.locator('.modal-backdrop')).toHaveCount(0);
            await page.locator('.modal').click({ position: { x: 1, y: 1 } });
            await expect(page.locator('.modal')).toHaveClass(/\bshow\b/);
        });
    });

    test.describe('events', () => {
        test('triggers show and hide events in order', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialogEvents = [];
                $.addEvent(
                    document,
                    'show.ui.modal shown.ui.modal hide.ui.modal hidden.ui.modal',
                    (event) => {
                        window.dialogEvents.push(event.type);
                    },
                );
                window.dialog = new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.dialog.close();
            });
            await expect(page.locator('.modal')).toHaveCount(0);

            expect(await page.evaluate((_) => window.dialogEvents)).toEqual([
                'show',
                'shown',
                'hide',
                'hidden',
            ]);
        });

        test('cleans up after the hidden event', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialog = new UI.Dialog();
                window.dialogNode = window.dialog.node;
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.dialog.close();
            });
            await expect(page.locator('.modal')).toHaveCount(0);

            expect(await page.evaluate((_) => ({
                ariaHidden: $.getAttribute(window.dialogNode, 'aria-hidden'),
                ariaModal: $.getAttribute(window.dialogNode, 'aria-modal'),
                connected: $.isConnected(window.dialogNode),
            }))).toEqual({
                ariaHidden: 'true',
                ariaModal: 'false',
                connected: false,
            });
        });
    });

    test.describe('focus trap', () => {
        test('prevents focus outside the Dialog', async ({ page }) => {
            await page.evaluate((_) => {
                $.setHTML(document.body, '<button id="outside" type="button"></button>');
                new UI.Dialog({ buttons: [{ text: 'Action' }] });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.locator('#outside').focus();

            await expect(page.locator('.btn-close')).toBeFocused();
        });
    });

    test.describe('stacked dialogs', () => {
        test('stacks Dialogs and reindexes after closing', async ({ page }) => {
            await page.evaluate((_) => {
                window.firstDialog = new UI.Dialog({ title: 'First' });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.secondDialog = new UI.Dialog({ title: 'Second' });
            });
            await expect(page.locator('.modal').nth(1)).toHaveAttribute('aria-hidden', 'false');

            await expect(page.locator('.modal')).toHaveCount(2);
            await expect(page.locator('.modal').nth(0)).not.toHaveAttribute('style');
            await expect(page.locator('.modal').nth(1)).toHaveAttribute('style', 'z-index: 1080;');
            await expect(page.locator('.modal-backdrop')).toHaveCount(2);
            await expect(page.locator('.modal-backdrop').nth(1)).toHaveAttribute('style', 'z-index: 1070;');

            await page.evaluate((_) => {
                window.secondDialog.close();
            });

            await expect(page.locator('.modal')).toHaveCount(1);
            await expect(page.locator('.modal')).not.toHaveAttribute('style');
            await expect(page.locator('.modal-backdrop')).toHaveCount(1);
            await expect(page.locator('body')).toHaveClass(/\bmodal-open\b/);
        });
    });

    test.describe('customization', () => {
        test('uses customized classes and language', async ({ page }) => {
            await page.evaluate((_) => {
                UI.Dialog.classes.btnClose = 'custom-close';
                UI.Dialog.classes.modal = 'modal custom-modal';
                UI.Dialog.lang.close = 'Dismiss';
                new UI.Dialog();
            });

            await expect(page.locator('.modal')).toHaveClass(/\bcustom-modal\b/);
            await expect(page.getByRole('button', { name: 'Dismiss' })).toHaveClass('custom-close');
        });
    });
});
