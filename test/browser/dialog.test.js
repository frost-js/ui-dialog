import { expect, test } from '#test';

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
            await page.evaluate((_) => {
                const options = { title: 'First' };
                window.firstDialog = new UI.Dialog(options);
                options.title = 'Changed';
                window.secondDialog = new UI.Dialog({ title: 'Second' });
            });

            await expect(page.locator('.modal-title')).toHaveText(['First', 'Second']);
            expect(await page.evaluate((_) =>
                window.firstDialog.options !== window.secondDialog.options,
            )).toBe(true);
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
            const initialAriaState = await page.evaluate((_) => {
                const dialog = new UI.Dialog({ title: 'Dialog title' });
                return {
                    ariaHidden: $.getAttribute(dialog.node, 'aria-hidden'),
                    ariaModal: $.getAttribute(dialog.node, 'aria-modal'),
                };
            });

            expect(initialAriaState.ariaHidden).toBe('true');
            expect(initialAriaState.ariaModal).toBe(null);

            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');
            await expect(page.locator('.modal')).toHaveAttribute('aria-modal', 'true');
        });
    });

    test.describe('#close', () => {
        for (const backdrop of ['static', false]) {
            test(`queues an immediate close with backdrop=${backdrop}`, async ({ page }) => {
                await page.evaluate((backdrop) => {
                    window.dialogEvents = [];
                    $.addEvent(document, 'shown.ui.modal hide.ui.modal hidden.ui.modal', (event) => {
                        window.dialogEvents.push(event.type);
                    });
                    window.dialog = new UI.Dialog({ backdrop });
                    window.dialog.close();
                    window.dialog.close();
                }, backdrop);

                await expect(page.locator('.modal')).toHaveCount(0);
                await expect(page.locator('.modal-backdrop')).toHaveCount(0);
                await expect(page.locator('body')).not.toHaveClass(/\bmodal-open\b/);
                expect(await page.evaluate((_) => window.dialogEvents)).toEqual([
                    'shown', 'hide', 'hidden',
                ]);
                expect(await page.evaluate((_) => window.dialog.node)).toBe(null);
                expect(await page.evaluate((_) => window.dialog.options)).toBe(null);
            });
        }

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

            await page.evaluate((_) => window.dialog.close());
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

            expect(await page.evaluate((_) => window.dialog.node)).toBe(null);
            expect(await page.evaluate((_) => window.dialog.options)).toBe(null);
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
            await page.evaluate((_) => {
                const content = $.create('span', {
                    attributes: { id: 'dialog-content' },
                    text: 'DOM content',
                });
                new UI.Dialog({ content });
            });

            await expect(page.locator('.modal-body > #dialog-content'))
                .toHaveText('DOM content');
        });

        test('appends QuerySet content', async ({ page }) => {
            await page.evaluate((_) => {
                const first = $.create('span', { text: 'First' });
                const second = $.create('span', { text: 'Second' });
                new UI.Dialog({ content: $([first, second]) });
            });

            const content = page.locator('.modal-body > span');
            await expect(content).toHaveCount(2);
            await expect(content).toHaveText(['First', 'Second']);
        });

        test('does not render an empty body', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });

            await expect(page.locator('.modal-body')).toHaveCount(0);
        });
    });

    test.describe('title and ariaLabel options', () => {
        test('renders and associates the title with the dialog', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog({ title: 'Dialog title' });
            });

            const modal = page.locator('.modal');
            const title = modal.locator('.modal-title');
            await expect(title).toHaveText('Dialog title');
            await expect(modal).not.toHaveAttribute('aria-label');
            await expect(title).toHaveAttribute('id', /^ui-dialog-title-/);
            await expect(title).toHaveJSProperty('tagName', 'H2');

            const titleId = await title.getAttribute('id');
            await expect(modal).toHaveAttribute('aria-labelledby', titleId);
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
        for (const { name, options, count } of [
            { name: 'default', options: {}, count: 1 },
            { name: 'enabled', options: { closeBtn: true }, count: 1 },
            { name: 'disabled', options: { closeBtn: false }, count: 0 },
        ]) {
            test(`renders the close button and header (${name})`, async ({ page }) => {
                await page.evaluate((options) => {
                    new UI.Dialog(options);
                }, options);

                await expect(page.locator('.btn-close')).toHaveCount(count);
                await expect(page.locator('.modal-header')).toHaveCount(count);
            });
        }

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
        for (const { name, buttons, expected } of [
            { name: 'empty array', buttons: [], expected: [] },
            { name: 'custom array', buttons: [{ text: 'Custom' }], expected: ['Custom'] },
        ]) {
            test(`replaces default buttons without inheriting callbacks (${name})`, async ({ page }) => {
                const hasCallbacks = await page.evaluate((buttons) => {
                    UI.Dialog.defaults.buttons = [
                        { text: 'Default', callback: () => {} },
                        { text: 'Extra' },
                    ];
                    const dialog = new UI.Dialog({ buttons });
                    return dialog.options.buttons.some((button) => typeof button.callback === 'function');
                }, buttons);

                await expect(page.locator('.modal-footer button')).toHaveText(expected);
                await expect(page.locator('.modal-footer')).toHaveCount(expected.length ? 1 : 0);
                expect(hasCallbacks).toBe(false);
            });
        }

        for (const source of ['input', 'defaults']) {
            test(`isolates button callbacks from later ${source} changes`, async ({ page }) => {
                await page.evaluate((source) => {
                    window.actions = [];
                    const buttons = [{ text: 'Save', callback: () => window.actions.push('original') }];
                    if (source === 'defaults') {
                        UI.Dialog.defaults.buttons = buttons;
                    }
                    new UI.Dialog(source === 'input' ? { buttons } : {});
                    buttons[0].text = 'Changed';
                    buttons[0].callback = () => window.actions.push('changed');
                    buttons.push({ text: 'Extra' });
                }, source);
                await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');
                await expect(page.locator('.modal-footer button')).toHaveText(['Save']);

                await page.getByRole('button', { name: 'Save' }).click();

                await expect(page.locator('.modal')).toHaveCount(0);
                expect(await page.evaluate((_) => window.actions)).toEqual(['original']);
            });
        }

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

        test('handles only the first action across repeated and different button clicks', async ({ page }) => {
            await page.evaluate((_) => {
                window.actions = [];
                new UI.Dialog({
                    buttons: [
                        { text: 'Save', callback: () => window.actions.push('save') },
                        { text: 'Cancel', callback: () => window.actions.push('cancel') },
                    ],
                });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                const [save, cancel] = document.querySelectorAll('.modal-footer button');
                // Dispatch in one task, before asynchronous hide cleanup can remove the buttons.
                save.click();
                save.click();
                cancel.click();
            });

            await expect(page.locator('.modal')).toHaveCount(0);
            expect(await page.evaluate((_) => window.actions)).toEqual(['save']);
        });

        test('closes and reports a synchronous callback error', async ({ page }) => {
            await page.evaluate((_) => {
                window.dialog = new UI.Dialog({
                    closeBtn: false,
                    buttons: [{
                        text: 'Save',
                        callback: () => {
                            throw new Error('Action failed');
                        },
                    }],
                });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            const errorPromise = page.waitForEvent('pageerror');
            await page.getByRole('button', { name: 'Save' }).click();
            expect((await errorPromise).message).toBe('Action failed');

            await expect(page.locator('.modal')).toHaveCount(0);
            await expect(page.locator('.modal-backdrop')).toHaveCount(0);
            await expect(page.locator('body')).not.toHaveClass(/\bmodal-open\b/);
            expect(await page.evaluate((_) => window.dialog.node)).toBe(null);
            expect(await page.evaluate((_) => window.dialog.options)).toBe(null);
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
        for (const { name, options, expected } of [
            { name: 'default', options: {}, expected: 'modal-dialog' },
            { name: 'small', options: { size: 'sm' }, expected: 'modal-dialog modal-sm' },
            { name: 'large', options: { size: 'lg' }, expected: 'modal-dialog modal-lg' },
            { name: 'extra large', options: { size: 'xl' }, expected: 'modal-dialog modal-xl' },
        ]) {
            test(`renders the dialog size (${name})`, async ({ page }) => {
                await page.evaluate((options) => {
                    new UI.Dialog(options);
                }, options);

                await expect(page.locator('.modal-dialog')).toHaveCount(1);
                await expect(page.locator('.modal-dialog')).toHaveClass(expected);
            });
        }
    });

    test.describe('centerVertical option', () => {
        for (const { name, options, expected } of [
            { name: 'default', options: {}, expected: 'modal-dialog' },
            { name: 'enabled', options: { centerVertical: true }, expected: 'modal-dialog modal-dialog-centered' },
            { name: 'disabled', options: { centerVertical: false }, expected: 'modal-dialog' },
        ]) {
            test(`renders vertical centering (${name})`, async ({ page }) => {
                await page.evaluate((options) => {
                    new UI.Dialog(options);
                }, options);

                await expect(page.locator('.modal-dialog')).toHaveClass(expected);
            });
        }
    });

    test.describe('appendTo option', () => {
        test('appends to the document body by default', async ({ page }) => {
            await page.evaluate((_) => {
                new UI.Dialog();
            });

            await expect(page.locator('body > .modal')).toHaveCount(1);
        });

        test('appends to a custom QuerySet target', async ({ page }) => {
            await page.evaluate((_) => {
                document.body.innerHTML = '<section id="dialog-host"></section>';
                new UI.Dialog({ appendTo: $('#dialog-host') });
            });

            await expect(page.locator('#dialog-host > .modal')).toHaveCount(1);
        });
    });

    test.describe('backdrop option', () => {
        for (const { name, options, backdropCount, remaining } of [
            { name: 'default', options: {}, backdropCount: 1, remaining: 1 },
            { name: 'static', options: { backdrop: 'static' }, backdropCount: 1, remaining: 1 },
            { name: 'dismissible', options: { backdrop: true }, backdropCount: 1, remaining: 0 },
            { name: 'none', options: { backdrop: false }, backdropCount: 0, remaining: 1 },
        ]) {
            test(`handles backdrop clicks (${name})`, async ({ page }) => {
                await page.evaluate((options) => {
                    new UI.Dialog(options);
                }, options);
                await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');
                await expect(page.locator('.modal-backdrop')).toHaveCount(backdropCount);

                await page.locator('.modal').click({ position: { x: 1, y: 1 } });

                await expect(page.locator('.modal')).toHaveCount(remaining);
                await expect(page.locator('.modal.show')).toHaveCount(remaining);
                await expect(page.locator('.modal-backdrop')).toHaveCount(backdropCount * remaining);
            });
        }
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

            expect(await page.evaluate((_) =>
                $.getAttribute(window.dialogNode, 'aria-hidden'),
            )).toBe('true');
            expect(await page.evaluate((_) =>
                $.getAttribute(window.dialogNode, 'aria-modal'),
            )).toBe('false');
            expect(await page.evaluate((_) =>
                $.isConnected(window.dialogNode),
            )).toBe(false);
        });
    });

    test.describe('focus trap', () => {
        test('restores focus to the opener after closing', async ({ page }) => {
            await page.evaluate((_) => {
                document.body.innerHTML = '<button id="opener" type="button">Open dialog</button>';
            });
            await page.locator('#opener').focus();
            await page.evaluate((_) => {
                new UI.Dialog();
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');
            await expect(page.locator('.modal')).toBeFocused();

            await page.getByRole('button', { name: 'Close', exact: true }).click();

            await expect(page.locator('.modal')).toHaveCount(0);
            await expect(page.locator('#opener')).toBeFocused();
        });

        test('prevents focus outside the Dialog', async ({ page }) => {
            await page.evaluate((_) => {
                document.body.innerHTML = '<button id="outside" type="button"></button>';
                new UI.Dialog({ buttons: [{ text: 'Action' }] });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.locator('#outside').focus();

            await expect(page.locator('.btn-close')).toBeFocused();
        });
    });

    test.describe('stacked dialogs', () => {
        test('keeps the parent open when a nested dialog closes and still cleans up the parent', async ({ page }) => {
            await page.evaluate((_) => {
                const host = document.createElement('div');
                host.id = 'nested-host';
                window.parentDialog = new UI.Dialog({ title: 'Parent', content: host });
            });
            const parent = page.getByRole('dialog', { name: 'Parent', exact: true });
            await expect(parent).toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => {
                window.childDialog = new UI.Dialog({
                    title: 'Child',
                    appendTo: document.querySelector('#nested-host'),
                });
            });
            await expect(page.getByRole('dialog', { name: 'Child', exact: true }))
                .toHaveAttribute('aria-hidden', 'false');

            await page.evaluate((_) => window.childDialog.close());

            await expect(page.locator('#nested-host .modal')).toHaveCount(0);
            await expect(parent).toHaveClass(/\bshow\b/);
            await expect(page.locator('.modal-backdrop')).toHaveCount(1);
            await expect(page.locator('body')).toHaveClass(/\bmodal-open\b/);

            await page.evaluate((_) => window.parentDialog.close());

            await expect(page.locator('.modal')).toHaveCount(0);
            await expect(page.locator('.modal-backdrop')).toHaveCount(0);
            await expect(page.locator('body')).not.toHaveClass(/\bmodal-open\b/);
            expect(await page.evaluate((_) => ({
                child: window.childDialog.node,
                parent: window.parentDialog.node,
            }))).toEqual({ child: null, parent: null });
        });

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
