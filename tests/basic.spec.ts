import { test, expect } from '@playwright/test';

test.describe('Aknan Real Estate Website', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main heading is displayed
    await expect(page.getByRole('heading', { name: 'اكتشف منزل أحلامك' })).toBeVisible();
    
    // Check if the logo is present
    await expect(page.getByAltText('أكنان القمة العقارية')).toBeVisible();
    
    // Check if navigation links are present
    await expect(page.getByRole('link', { name: 'العقارات' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'من نحن' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'اتصل بنا' })).toBeVisible();
  });

  test('should navigate to properties page', async ({ page }) => {
    await page.goto('/');
    
    // Click on properties link
    await page.getByRole('link', { name: 'استكشف العقارات' }).first().click();
    
    // Should navigate to properties page
    await expect(page).toHaveURL('/properties');
    await expect(page.getByRole('heading', { name: 'العقارات' })).toBeVisible();
  });

  test('should protect admin routes', async ({ page }) => {
    // Try to access admin page without authentication
    await page.goto('/admin/properties');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();
  });

  test('should display admin login form', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check if login form elements are present
    await expect(page.getByLabel('البريد الإلكتروني')).toBeVisible();
    await expect(page.getByLabel('كلمة المرور')).toBeVisible();
    await expect(page.getByRole('button', { name: 'تسجيل الدخول' })).toBeVisible();
  });

  test('should have RTL layout', async ({ page }) => {
    await page.goto('/');
    
    // Check if the HTML has RTL direction
    const htmlElement = await page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');
    await expect(htmlElement).toHaveAttribute('lang', 'ar');
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'اكتشف منزل أحلامك' })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'اكتشف منزل أحلامك' })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: 'اكتشف منزل أحلامك' })).toBeVisible();
  });
});


