import { test, expect } from '@playwright/test';

test.describe('Role selection (public page)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the available profiles', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Choisissez votre profil' }),
    ).toBeVisible();
    await expect(page.getByText('Personnel TE')).toBeVisible();
    await expect(page.getByText('Personnel Externe')).toBeVisible();
  });

  test('selecting Personnel TE reveals lab and other-personnel options', async ({
    page,
  }) => {
    await page.locator('#role-personel').check();
    await expect(page.locator('#role-labo')).toBeVisible();
    await expect(page.locator('#role-other')).toBeVisible();
  });

  test('an external visitor is routed to the engagement form', async ({ page }) => {
    await page.locator('#role-extern').check();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/Engagment/);
    await expect(page.getByText('Engagement de confidentialité')).toBeVisible();
  });

  test('a TE lab employee is routed to the login page', async ({ page }) => {
    await page.locator('#role-personel').check();
    await page.locator('#role-labo').check();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });
});
