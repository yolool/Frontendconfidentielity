import { test, expect } from '@playwright/test';

/**
 * Auth/dashboard flows exercised against the REAL Spring Boot backend
 * (confidentialite-back) on http://localhost:8080, with real MySQL data:
 *   EMP001 / John Doe       / LABO
 *   EMP002 / Sarah Connor   / LABO
 *   EMP003 / Michael Scott  / HR
 *
 * The backend uses session (JSESSIONID) authentication, so the browser keeps
 * the session cookie after login. CORS is configured to allow localhost:4200.
 */
test.describe('Authentication & dashboard (real backend)', () => {
  test('an unauthenticated user is redirected home from /Dashboard', async ({
    page,
  }) => {
    await page.goto('/Dashboard');
    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/$/);
  });

  test('a non-lab employee can log in and see their confidentiality status', async ({
    page,
  }) => {
    // Full UI flow: Personnel TE -> Autre Personnel TE -> /login -> HR / EMP003
    await page.goto('/');
    await page.locator('#role-personel').check();
    await page.locator('#role-other').check();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('[formControlName="dep"]')).toBeVisible();

    await page.locator('[formControlName="idPersonnel"]').fill('EMP003');
    await page.selectOption('[formControlName="dep"]', 'HR');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.getByText('Bienvenue Michael Scott')).toBeVisible();
    await expect(page.getByText('Engagement de confidentialité')).toBeVisible();

    // Expand the collapse panel to see the pending-signature status.
    await page.locator('.dash-main .collapse-btn').first().click();
    await expect(page.getByText('En attente de signature')).toBeVisible();
  });

  test('a LAB employee reaches the impartiality form from the dashboard', async ({
    page,
  }) => {
    // Full UI flow: Personnel TE -> Personnel laboratoire TE -> /login -> EMP001
    await page.goto('/');
    await page.locator('#role-personel').check();
    await page.locator('#role-labo').check();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.locator('[formControlName="idPersonnel"]').fill('EMP001');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.getByText('Bienvenue John Doe')).toBeVisible();
    await expect(
      page.getByText(/Engagement d.impartialité et de confidentialité/).first(),
    ).toBeVisible();

    // Expand the panel and click the "signe" action to open the form.
    await page.locator('.dash-main .collapse-btn').first().click();
    await page.getByRole('button', { name: 'signe' }).click();

    await expect(page).toHaveURL(/\/EngagementImp/);
    await expect(
      page.getByText(/Engagement d.impartialité et de confidentialité/).first(),
    ).toBeVisible();
  });
});
