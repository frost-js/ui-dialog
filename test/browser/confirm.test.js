import { expect, test } from '#test';
import { resetPage } from '../setup/browser.js';

test.beforeEach(async ({ page }) => {
    await resetPage(page);
});

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

    test('reports false when Cancel is selected', async ({ page }) => {
        await page.evaluate((_) => {
            window.result = null;
            UI.confirm('Confirm content', (result) => {
                window.result = result;
            });
        });
        await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page.locator('.modal')).toHaveCount(0);
        expect(await page.evaluate((_) => window.result)).toBe(false);
    });

    test('reports true when OK is selected', async ({ page }) => {
        await page.evaluate((_) => {
            window.result = null;
            UI.confirm('Confirm content', (result) => {
                window.result = result;
            });
        });
        await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

        await page.getByRole('button', { name: 'OK' }).click();

        await expect(page.locator('.modal')).toHaveCount(0);
        expect(await page.evaluate((_) => window.result)).toBe(true);
    });

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
