// Funciones comunes para todos los casos de prueba.
const fs = require('fs');
const { expect } = require('@playwright/test');

const PASSWORD = 'secret_sauce';

/**
 * Precondición común: iniciar sesión con el tipo de usuario indicado.
 * El login no es una funcionalidad bajo prueba; se usa para entrar con
 * distintos tipos de usuario (standard_user, problem_user, error_user).
 */
async function login(page, username) {
  await page.goto('/');
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(PASSWORD);
  await page.getByTestId('login-button').click();
  await expect(page).toHaveURL(/\/inventory\.html$/);
}

/** Devuelve el data-test del botón de un producto: add-to-cart-<producto> o remove-<producto>. */
function botonId(accion, producto) {
  return `${accion}-${producto}`.replace(/\s+/g, '-').toLowerCase();
}

/** Agrega un producto desde el inventario. */
async function agregarProducto(page, producto) {
  await page.getByTestId(botonId('add-to-cart', producto)).click();
}

/**
 * Evidencia: guarda una captura de pantalla completa en la carpeta evidencias/
 * con el nombre del caso. Se llama desde test.afterEach, así que también se
 * genera cuando el caso falla (FAIL).
 */
async function guardarEvidencia(page, testInfo) {
  fs.mkdirSync('evidencias', { recursive: true });
  const nombre = testInfo.title.split(' - ')[0].trim().replace(/[^\w-]+/g, '_');
  const estado = testInfo.status === testInfo.expectedStatus ? 'PASS' : 'FAIL';
  const ruta = `evidencias/${nombre}_${estado}.png`;
  await page.screenshot({ path: ruta, fullPage: true });
  await testInfo.attach('evidencia', { path: ruta, contentType: 'image/png' });
}

const PRODUCTOS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
};

module.exports = { login, botonId, agregarProducto, guardarEvidencia, PRODUCTOS };
