import { test, expect } from '@playwright/test';

test.describe('Public standalone pages', () => {
  test('QR code page renders a generated QR code', async ({ page }) => {
    // qr-code-styling must load the logo image before it renders its canvas.
    const onePxPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );
    await page.route('**/assets/img/image.png', (route) =>
      route.fulfill({ contentType: 'image/png', body: onePxPng }),
    );

    await page.goto('/qr');
    // qr-code-styling appends a <canvas> into the component's container (the
    // container is referenced by an Angular template ref, not a DOM id).
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download QR' })).toBeVisible();
  });

  test('the /404 route shows the not-found page', async ({ page }) => {
    await page.goto('/404');
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
