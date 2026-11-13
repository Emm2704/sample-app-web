// @ts-check
// Flujo 3 - Checkout | Autor: Sebastian Rodriguez Camilo
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PASSWORD = 'secret_sauce';
const CLIENTE = { nombre: 'Sebastian', apellido: 'Rodriguez', postal: '760001' };

const dt = (id) => `[data-test="${id}"]`;

async function login(page, usuario) {
  await page.goto(BASE_URL);
  await page.fill(dt('username'), usuario);
  await page.fill(dt('password'), PASSWORD);
  await page.click(dt('login-button'));
  await expect(page).toHaveURL(/inventory\.html/);
}

async function evidencia(page, nombre) {
  await page.screenshot({ path: `evidencias/${nombre}.png`, fullPage: true });
}

async function irAlCheckoutConProducto(page) {
  await page.click(dt('add-to-cart-sauce-labs-backpack'));
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  await page.click('.shopping_cart_link');
  await page.click(dt('checkout'));
  await expect(page).toHaveURL(/checkout-step-one\.html/);
}

test.describe('Flujo 3 - Checkout', () => {
  test('F3-CN-001 - Compra completa con standard_user', async ({ page }) => {
    await login(page, 'standard_user');
    await irAlCheckoutConProducto(page);

    await page.fill(dt('firstName'), CLIENTE.nombre);
    await page.fill(dt('lastName'), CLIENTE.apellido);
    await page.fill(dt('postalCode'), CLIENTE.postal);
    await page.click(dt('continue'));

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.summary_total_label')).toContainText('32.39');
    await evidencia(page, 'F3-CN-001-resumen');

    await page.click(dt('finish'));
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('.complete-header')).toHaveText(/thank you for your order/i);
    await evidencia(page, 'F3-CN-001-confirmacion');
  });

  test('F3-CN-002 - Validacion de campos obligatorios', async ({ page }) => {
    await login(page, 'standard_user');
    await irAlCheckoutConProducto(page);

    await page.click(dt('continue'));
    await expect(page.locator(dt('error'))).toContainText('First Name is required');
    await evidencia(page, 'F3-CN-002-error-first-name');

    await page.fill(dt('firstName'), CLIENTE.nombre);
    await page.click(dt('continue'));
    await expect(page.locator(dt('error'))).toContainText('Last Name is required');

    await page.fill(dt('lastName'), CLIENTE.apellido);
    await page.click(dt('continue'));
    await expect(page.locator(dt('error'))).toContainText('Postal Code is required');
    await evidencia(page, 'F3-CN-002-error-postal-code');
  });

  test('F3-BE-001 - Last Name no debe sobrescribir First Name (problem_user)', async ({ page }) => {
    test.info().annotations.push({
      type: 'defecto',
      description: 'Con problem_user, escribir en Last Name modifica First Name.',
    });
    await login(page, 'problem_user');
    await irAlCheckoutConProducto(page);

    await page.fill(dt('firstName'), CLIENTE.nombre);
    await page.fill(dt('lastName'), CLIENTE.apellido);
    await evidencia(page, 'F3-BE-001-campos');

    await expect.soft(page.locator(dt('firstName'))).toHaveValue(CLIENTE.nombre);
    await expect(page.locator(dt('lastName'))).toHaveValue(CLIENTE.apellido);
  });

  test('F3-BE-002 - No debe permitir checkout con carrito vacio', async ({ page }) => {
    test.info().annotations.push({
      type: 'defecto',
      description: 'La aplicacion permite iniciar la compra sin productos.',
    });
    await login(page, 'standard_user');
    await page.click('.shopping_cart_link');
    await expect(page.locator('.cart_item')).toHaveCount(0);

    await page.click(dt('checkout'));
    await evidencia(page, 'F3-BE-002-carrito-vacio');

    // Comportamiento esperado: permanecer en el carrito (boton bloqueado o mensaje de error).
    await expect(page).toHaveURL(/cart\.html/);
  });
});
