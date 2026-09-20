import { expect, test } from '#test';

test.describe('confirm', () => {
    test('renders a confirm Dialog', async ({ page }) => {
        await page.evaluate((_) => {
            UI.confirm('Confirm content');
        });

        await expect(page.locator('.modal-body')).toHaveText('Confirm content');
        await expect(page.locator('.modal-footer button')).toHaveText(['Cancel', 'OK']);
        await expect(page.locator('.modal-footer button').first()).toHaveClass(/\bbtn-secondary\b/);
        await expect(page.locator('.modal-footer button').nth(1)).toHaveClass(/\bbtn-primary\b/);
    });

    for (const { button, expected } of [
        { button: 'Cancel', expected: false },
        { button: 'OK', expected: true },
    ]) {
        test(`reports ${expected} when ${button} is selected`, async ({ page }) => {
            await page.evaluate((_) => {
                window.result = null;
                UI.confirm('Confirm content', (result) => {
                    window.result = result;
                });
            });
            await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

            await page.getByRole('button', { name: button }).click();

            await expect(page.locator('.modal')).toHaveCount(0);
            expect(await page.evaluate((_) => window.result)).toBe(expected);
        });
    }

    test('allows options to override generated values', async ({ page }) => {
        await page.evaluate((_) => {
            UI.confirm('Confirm content', () => { }, {
                buttons: [{ text: 'Custom' }],
                content: 'Custom content',
            });
        });

        await expect(page.locator('.modal-body')).toHaveText('Custom content');
        await expect(page.locator('.modal-footer button')).toHaveText('Custom');
    });
});
