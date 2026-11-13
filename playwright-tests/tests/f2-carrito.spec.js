// FLUJO 2 - Carrito de compras (HU-CART-01)
const { test, expect } = require('@playwright/test');
const { login, botonId, agregarProducto, guardarEvidencia, PRODUCTOS } = require('./helpers');

test.afterEach(async ({ page }, testInfo) => {
  await guardarEvidencia(page, testInfo);
});

test.describe('Flujo 2 - Carrito de compras', () => {

  // Técnica: Transición de estados (S0 = No agregado, S1 = En carrito)
  test('F2-CN-001 - Transiciones del producto entre No agregado y En carrito', async ({ page }) => {
    await login(page, 'standard_user');

    const contador = page.getByTestId('shopping-cart-badge');
    const btnAgregar = page.getByTestId(botonId('add-to-cart', PRODUCTOS.backpack));
    const btnQuitar = page.getByTestId(botonId('remove', PRODUCTOS.backpack));

    // Paso 1: estado inicial S0
    await expect(btnAgregar).toHaveText('Add to cart');
    await expect(contador).toHaveCount(0);

    // Paso 2 - T1 (S0 -> S1): botón "Remove" y contador = 1
    await btnAgregar.click();
    await expect(btnQuitar).toHaveText('Remove');
    await expect(contador).toHaveText('1');

    // Paso 3 - T2 (S1 -> S0) desde el inventario: botón "Add to cart" y sin contador
    await btnQuitar.click();
    await expect(btnAgregar).toHaveText('Add to cart');
    await expect(contador).toHaveCount(0);

    // Pasos 4-5: agregar de nuevo e ir al carrito
    await btnAgregar.click();
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText([PRODUCTOS.backpack]);

    // Paso 6 - T3 (S1 -> S0) desde el carrito: el producto desaparece y no hay contador
    await page.getByTestId(botonId('remove', PRODUCTOS.backpack)).click();
    await expect(page.getByTestId('inventory-item-name')).toHaveCount(0);
    await expect(contador).toHaveCount(0);

    // Paso 7: volver al inventario, el botón dice "Add to cart"
    await page.getByTestId('continue-shopping').click();
    await expect(btnAgregar).toHaveText('Add to cart');
  });

  // Técnica: Análisis de valores límite (rango válido 0 - 6 productos)
  test('F2-CN-002 - Contador del carrito en los límites 0, 1 y 6', async ({ page }) => {
    await login(page, 'standard_user');
    const contador = page.getByTestId('shopping-cart-badge');

    // Mín = 0: el contador no se muestra
    await expect(contador).toHaveCount(0);

    // Mín + 1 = 1
    await agregarProducto(page, PRODUCTOS.backpack);
    await expect(contador).toHaveText('1');

    // Máx = 6: agregar los 5 restantes
    for (const p of [PRODUCTOS.bikeLight, PRODUCTOS.boltTShirt, PRODUCTOS.fleeceJacket, PRODUCTOS.onesie, PRODUCTOS.redTShirt]) {
      await agregarProducto(page, p);
    }
    await expect(contador).toHaveText('6');
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(6);

    // Máx + 1 = 7: no alcanzable, no queda ningún botón "Add to cart"
    await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
  });

  // Técnica: Partición de equivalencia - clase inválida (usuario sin sesión)
  test('F2-CN-003 - Acceso al carrito sin sesión iniciada', async ({ page }) => {
    // Precondición: sin sesión (cada test inicia con un navegador limpio)
    // Pasos 1-2: abrir directamente /cart.html
    await page.goto('/cart.html');

    // Resultado esperado 1: redirección al login
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('login-button')).toBeVisible();
    // Resultado esperado 2: mensaje de error
    await expect(page.getByTestId('error')).toHaveText(
      "Epic sadface: You can only access '/cart.html' when you are logged in.",
    );
    // Resultado esperado 3: no se muestra el carrito
    await expect(page.getByTestId('cart-list')).toHaveCount(0);
  });

  // Técnica: Basada en la experiencia - Error guessing
  test('F2-BE-001 - problem_user agrega Sauce Labs Bolt T-Shirt al carrito', async ({ page }) => {
    await login(page, 'problem_user');

    // Paso 2: clic en "Add to cart"
    await agregarProducto(page, PRODUCTOS.boltTShirt);

    // Resultado esperado 1: el botón cambia a "Remove"
    await expect(page.getByTestId(botonId('remove', PRODUCTOS.boltTShirt))).toHaveText('Remove');
    // Resultado esperado 2: contador = 1
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    // Resultado esperado 3: el producto aparece en el carrito
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByTestId('inventory-item-name')).toHaveText([PRODUCTOS.boltTShirt]);
  });
});
