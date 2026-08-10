import { test, expect } from '@playwright/test';

/**
 * The "guest" (external visitor => Personnel Externe) pathway does not need the
 * backend, so it can be tested fully end-to-end against the real app.
 */
test.describe('Guest engagement form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#role-extern').check();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/Engagment/);
  });

  test('renders the confidentialité engagement form', async ({ page }) => {
    await expect(
      page.getByText('Engagement de confidentialité', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('[formControlName="name"]')).toBeVisible();
  });

  test('reveals the submit button once "Lu et approuvé" is checked', async ({
    page,
  }) => {
    await page.locator('[formControlName="name"]').fill('Jean Dupont');
    await page.locator('[formControlName="role"]').fill('Ingénieur');
    await page.locator('[formControlName="company"]').fill('TE Connectivity');
    await page.locator('[formControlName="city"]').fill('Casablanca');

    await expect(page.getByRole('button', { name: "Confirmer l'envoi" })).toBeHidden();
    await page.locator('[formControlName="check"]').check();
    await expect(page.getByRole('button', { name: "Confirmer l'envoi" })).toBeVisible();
  });

  test('shows required-field errors when submitting an empty form', async ({
    page,
  }) => {
    // the TE ID is optional for guests; the other text fields are required
    await page.locator('[formControlName="check"]').check();
    const confirm = page.getByRole('button', { name: "Confirmer l'envoi" });
    await expect(confirm).toBeVisible();

    // give ngAfterViewInit time to instantiate the signature pad
    await page.waitForTimeout(300);
    await confirm.click();

    await expect(
      page.getByText('champ obligatoire.', { exact: false }).first(),
    ).toBeVisible();
  });
});
