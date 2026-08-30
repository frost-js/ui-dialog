import { expect, test } from '#test';
import { resetPage } from '../setup/browser.js';

test.beforeEach(async ({ page }) => {
    await resetPage(page);
});

test.describe('alert', () => {
    test('renders an alert Dialog', async ({ page }) => {
        await page.evaluate((_) => {
            UI.alert('Alert content');
        });

        await expect(page.locator('.modal-body')).toHaveText('Alert content');
        await expect(page.locator('.modal-footer button')).toHaveText('OK');
        await expect(page.locator('.modal-footer button')).toHaveClass(/\bbtn-primary\b/);
    });

    test('runs the callback when OK is selected', async ({ page }) => {
        await page.evaluate((_) => {
            window.callbackCount = 0;
            UI.alert('Alert content', () => {
                window.callbackCount++;
            });
        });
        await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

        await page.getByRole('button', { name: 'OK' }).click();

        await expect(page.locator('.modal')).toHaveCount(0);
        expect(await page.evaluate((_) => window.callbackCount)).toBe(1);
    });

    test('does not run the callback when the Dialog is closed', async ({ page }) => {
        await page.evaluate((_) => {
            window.callbackCount = 0;
            UI.alert('Alert content', () => {
                window.callbackCount++;
            });
        });
        await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

        await page.locator('.btn-close').click();

        await expect(page.locator('.modal')).toHaveCount(0);
        expect(await page.evaluate((_) => window.callbackCount)).toBe(0);
    });

    test('allows options to override generated values', async ({ page }) => {
        await page.evaluate((_) => {
            UI.alert('Alert content', () => { }, {
                buttons: [{ text: 'Custom' }],
                content: 'Custom content',
                title: 'Custom title',
            });
        });

        await expect(page.locator('.modal-title')).toHaveText('Custom title');
        await expect(page.locator('.modal-body')).toHaveText('Custom content');
        await expect(page.locator('.modal-footer button')).toHaveText('Custom');
    });

    test('supports default arguments', async ({ page }) => {
        await page.evaluate((_) => {
            UI.alert();
        });
        await expect(page.locator('.modal')).toHaveAttribute('aria-hidden', 'false');

        await page.getByRole('button', { name: 'OK' }).click();

        await expect(page.locator('.modal')).toHaveCount(0);
    });
});
