import { test, expect } from '@playwright/test';

test('loads auth screen with MRX branding', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/MRX/i);
  await expect(page.getByText(/MRX|medication|лекарств/i).first()).toBeVisible();
});

test('health API responds', async ({ request }) => {
  const res = await request.get('http://localhost:3001/api/health');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe('ok');
});
