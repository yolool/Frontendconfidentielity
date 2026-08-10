import { test, expect } from '@playwright/test';

/**
 * IHM = Interface Homme-Machine (UI) tests.
 *
 * These exercise the interface directly against the REAL backend
 * (confidentialite-back on http://localhost:8080, session-based auth, MySQL).
 * Real accounts used:
 *   EMP003 / Michael Scott / HR      (non-lab employee)
 *   EMP001 / John Doe       / LABO   (lab employee)
 */
test.describe('IHM (Interface Homme-Machine)', () => {
  test('the page shell (header, logo, footer) renders on the home screen', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('.header .logo a')).toBeVisible();
    await expect(page.locator('.footer-main')).toContainText('TE Connectivity');
    await expect(
      page.getByRole('heading', { name: 'Choisissez votre profil' }),
    ).toBeVisible();
  });

  test('login page lists the real departments coming from the backend', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('as', 'AutrePersonelTE'));
    await page.goto('/login');

    const dep = page.locator('[formControlName="dep"]');
    await expect(dep).toBeVisible();
    const options = await dep.locator('option').allTextContents();
    expect(options).toEqual(expect.arrayContaining(['FINANCE', 'HR', 'IT']));
  });

  test('login page shows required-field errors on an empty submit', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('as', 'AutrePersonelTE'));
    await page.goto('/login');
    await expect(page.locator('[formControlName="dep"]')).toBeVisible();

    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('champ obligatoire.', { exact: false }).first()).toBeVisible();
  });

  test('authenticated header shows the logout control after login', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#role-personel').check();
    await page.locator('#role-other').check();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.locator('[formControlName="idPersonnel"]').fill('EMP003');
    await page.selectOption('[formControlName="dep"]', 'HR');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.locator('#signout')).toBeVisible();
  });

  test('dashboard expand/collapse toggles the signature status panel', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#role-personel').check();
    await page.locator('#role-other').check();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.locator('[formControlName="idPersonnel"]').fill('EMP003');
    await page.selectOption('[formControlName="dep"]', 'HR');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.getByText('Bienvenue Michael Scott')).toBeVisible();

    // Status is collapsed initially.
    await expect(page.getByText('En attente de signature')).toBeHidden();

    // Expand -> status visible.
    const toggle = page.locator('.dash-main .collapse-btn').first();
    await toggle.click();
    await expect(page.getByText('En attente de signature')).toBeVisible();

    // Collapse -> hidden again.
    await page.locator('.dash-main .collapse-btn').first().click();
    await expect(page.getByText('En attente de signature')).toBeHidden();
  });

  test('an authenticated employee opens the confidentialité form from the dashboard', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#role-personel').check();
    await page.locator('#role-other').check();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.locator('[formControlName="idPersonnel"]').fill('EMP003');
    await page.selectOption('[formControlName="dep"]', 'HR');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/Dashboard/);
    await page.locator('.dash-main .collapse-btn').first().click();
    await page.getByRole('button', { name: 'signe' }).click();

    await expect(page).toHaveURL(/\/Engagment/);
    await expect(page.locator('[formControlName="name"]')).toBeVisible();
  });

  test('logout from the header returns to the home screen', async ({ page }) => {
    await page.goto('/');
    await page.locator('#role-personel').check();
    await page.locator('#role-other').check();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.locator('[formControlName="idPersonnel"]').fill('EMP003');
    await page.selectOption('[formControlName="dep"]', 'HR');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.locator('#signout')).toBeVisible();

    await page.locator('#signout').click();

    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/$/);
    await expect(
      page.getByRole('heading', { name: 'Choisissez votre profil' }),
    ).toBeVisible();
  });
});
