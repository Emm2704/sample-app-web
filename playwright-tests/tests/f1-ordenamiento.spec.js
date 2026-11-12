// FLUJO 1 - Ordenamiento de productos (HU-SORT-01)
const { test, expect } = require('@playwright/test');
const { login, guardarEvidencia, PRODUCTOS } = require('./helpers');

test.afterEach(async ({ page }, testInfo) => {
  await guardarEvidencia(page, testInfo);
});

test.describe('Flujo 1 - Ordenamiento de productos', () => {

  // Técnica: Partición de equivalencia (clase "por nombre" y clase "por precio")
  test('F1-CN-001 - Ordenar por nombre descendente y por precio ascendente', async ({ page }) => {
    // Precondición
    await login(page, 'standard_user');

    const selector = page.getByTestId('product-sort-container');
    const opcionActiva = page.getByTestId('active-option');
    const nombres = page.getByTestId('inventory-item-name');
    const precios = page.getByTestId('inventory-item-price');

    // Pasos 1-2: clase "por nombre" -> representante Name (Z to A)
    await selector.selectOption('za');
    // Resultado esperado 1: el selector muestra "Name (Z to A)"
    await expect(opcionActiva).toHaveText('Name (Z to A)');
    // Resultado esperado 2: orden alfabético descendente
    await expect(nombres).toHaveText([
      PRODUCTOS.redTShirt,
      PRODUCTOS.onesie,
      PRODUCTOS.fleeceJacket,
      PRODUCTOS.boltTShirt,
      PRODUCTOS.bikeLight,
      PRODUCTOS.backpack,
    ]);

    // Pasos 3-4: clase "por precio" -> representante Price (low to high)
    await selector.selectOption('lohi');
    // Resultado esperado 3: el selector muestra "Price (low to high)"
    await expect(opcionActiva).toHaveText('Price (low to high)');
    // Resultado esperado 4: precios en orden ascendente
    await expect(precios).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);
    await expect(nombres.first()).toHaveText(PRODUCTOS.onesie);
    await expect(nombres.last()).toHaveText(PRODUCTOS.fleeceJacket);
  });

  // Técnica: Caja blanca - cobertura de decisiones de sortByOption() (src/pages/Inventory.jsx)
  // Cada combinación fuerza una rama distinta: D1 (problem_user), D2 (error_user), D3 (standard_user / "hilo").
  const combinaciones = [
    { id: 'C1', usuario: 'problem_user', rama: 'D1 verdadera' },
    { id: 'C2', usuario: 'error_user', rama: 'D1 falsa, D2 verdadera' },
    { id: 'C3', usuario: 'standard_user', rama: 'D1 falsa, D2 falsa, D3 = hilo' },
  ];

  for (const c of combinaciones) {
    test(`F1-CB-001 ${c.id} - Ordenar Price (high to low) con ${c.usuario} (${c.rama})`, async ({ page }) => {
      // Registrar si aparece algún diálogo (alert) durante el ordenamiento
      let dialogo = null;
      page.on('dialog', async (d) => {
        dialogo = d.message();
        await d.dismiss();
      });

      // Precondición
      await login(page, c.usuario);

      // Paso 3: elegir Price (high to low)
      await page.getByTestId('product-sort-container').selectOption('hilo');

      // Pequeña espera para registrar un posible diálogo (alert)
      await page.waitForTimeout(500);

      const nombres = page.getByTestId('inventory-item-name');
      const precios = page.getByTestId('inventory-item-price');

      // Resultado esperado 1: no aparece ningún diálogo de error
      expect.soft(dialogo, 'No debe aparecer ningún diálogo de error').toBeNull();
      // Resultado esperado 2: el selector muestra la opción elegida
      await expect.soft(page.getByTestId('active-option')).toHaveText('Price (high to low)');
      // Resultado esperado 3: primero Fleece Jacket ($49.99) y último Onesie ($7.99)
      await expect(nombres.first()).toHaveText(PRODUCTOS.fleeceJacket);
      await expect(precios.first()).toHaveText('$49.99');
      await expect(nombres.last()).toHaveText(PRODUCTOS.onesie);
      await expect(precios.last()).toHaveText('$7.99');
    });
  }
});
