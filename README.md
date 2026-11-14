# Pruebas automatizadas con Playwright – Sauce Labs Sample App Web

Fork de [saucelabs/sample-app-web](https://github.com/saucelabs/sample-app-web) usado para el **Examen Final de Pruebas y Calidad de Software 2026-II**: diseño, automatización con Playwright y ejecución de casos de prueba sobre la aplicación **Swag Labs**.

**Integrantes**

- Emmanuel Fernando Valencia Sotelo
- Sebastian Rodriguez Camilo

## Contenido

- [Funcionalidades probadas](#funcionalidades-probadas)
- [1. Requisitos](#1-requisitos)
- [2. Clonar e instalar la aplicación](#2-clonar-e-instalar-la-aplicación)
- [3. Instalar y configurar Playwright](#3-instalar-y-configurar-playwright)
- [4. Ejecutar las pruebas](#4-ejecutar-las-pruebas)
- [5. Resultados esperados](#5-resultados-esperados)
- [6. Evidencias y reporte](#6-evidencias-y-reporte)
- [7. Solución de problemas](#7-solución-de-problemas)

## Funcionalidades probadas

| Flujo | Funcionalidad | Archivo | Casos |
|---|---|---|---|
| Flujo 1 | Ordenamiento de productos | `playwright-tests/tests/f1-ordenamiento.spec.js` | F1-CN-001, F1-CB-001 (C1, C2, C3) |
| Flujo 2 | Carrito de compras | `playwright-tests/tests/f2-carrito.spec.js` | F2-CN-001, F2-CN-002, F2-CN-003, F2-BE-001 |
| Flujo 3 | Checkout | `playwright-tests/tests/f3-checkout.spec.js` | F3-CN-001, F3-CN-002, F3-BE-001, F3-BE-002 |

El login no se prueba como funcionalidad: se usa como precondición para ingresar con los distintos tipos de usuario de la aplicación (`standard_user`, `problem_user`, `error_user`; contraseña `secret_sauce`).

| Técnica | Casos |
|---|---|
| Partición de equivalencia | F1-CN-001, F2-CN-003, F3-CN-001 |
| Análisis de valores límite | F2-CN-002 |
| Tabla de decisión | F3-CN-002 |
| Transición de estados | F2-CN-001 |
| Caja blanca (cobertura de decisiones de `sortByOption()`) | F1-CB-001 |
| Basada en la experiencia (error guessing) | F2-BE-001, F3-BE-001, F3-BE-002 |

## 1. Requisitos

| Programa | Versión | Descarga |
|---|---|---|
| Git | Reciente | https://git-scm.com/downloads |
| Node.js (incluye npm) | **24.9.0 o superior** | https://nodejs.org/en/download |
| Google Chrome | Reciente | https://www.google.com/chrome/ |
| Visual Studio Code (opcional) | Reciente | https://code.visualstudio.com/ |

Verificar la instalación en una terminal nueva:

```bash
git --version
node -v
npm -v
```

> **Windows / PowerShell:** si aparece el error *"la ejecución de scripts está deshabilitada en este sistema"* al usar `npm` o `npx`, ejecutar una sola vez:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

## 2. Clonar e instalar la aplicación

```bash
git clone https://github.com/Emm2704/sample-app-web.git
cd sample-app-web
npm install
```

Levantar la aplicación (dejar esta terminal abierta):

```bash
npm run start
```

La aplicación queda disponible en **http://localhost:3000**.

## 3. Instalar y configurar Playwright

Las pruebas están en la carpeta `playwright-tests`, que tiene su propio `package.json`. En una **segunda terminal**:

```bash
cd sample-app-web/playwright-tests
npm install
npx playwright install chrome
```

> Si Playwright no encuentra Chrome, instalar también el navegador incluido: `npx playwright install chromium`.

### Configuración (`playwright-tests/playwright.config.js`)

| Opción | Valor | Para qué |
|---|---|---|
| `testDir` | `./tests` | Carpeta de los scripts |
| `baseURL` | `http://localhost:3000` | Dirección de la aplicación local |
| `testIdAttribute` | `data-test` | Permite usar `getByTestId()` con los atributos `data-test` de la app |
| `projects` | `chrome` (`channel: 'chrome'`) | Ejecuta las pruebas en Google Chrome |
| `reporter` | `html` | Genera el reporte HTML en `playwright-report/` |

### Estructura

```
playwright-tests/
├── package.json
├── playwright.config.js
├── evidencias/                    # capturas generadas por las pruebas
└── tests/
    ├── helpers.js                 # login por tipo de usuario, productos y captura de evidencias
    ├── f1-ordenamiento.spec.js    # Flujo 1
    ├── f2-carrito.spec.js         # Flujo 2
    └── f3-checkout.spec.js        # Flujo 3
```

## 4. Ejecutar las pruebas

Con la aplicación corriendo en la primera terminal, desde `playwright-tests`:

| Para… | Comando |
|---|---|
| Ejecutar todas las pruebas | `npx playwright test` |
| Ver el navegador mientras corren | `npx playwright test --headed` |
| Modo visual interactivo | `npx playwright test --ui` |
| Ejecutar un flujo | `npx playwright test tests/f2-carrito.spec.js` |
| Ejecutar un caso | `npx playwright test -g "F2-CN-001"` |
| Ejecutar de a una prueba | `npx playwright test --workers=1` |
| Depurar paso a paso | `npx playwright test -g "F1-CN-001" --debug` |
| Abrir el reporte HTML | `npx playwright show-report` |

## 5. Resultados esperados

Se ejecutan **12 pruebas**: **7 aprobadas y 5 fallidas**. Las 5 fallas corresponden a **defectos reales** de la aplicación, que se manifiestan con los usuarios especiales:

| Prueba | Resultado | Defecto encontrado |
|---|---|---|
| F1-CN-001 | ✅ Pasa | — |
| F1-CB-001 C1 | ❌ Falla | `problem_user` no puede ordenar los productos (la lista no cambia) |
| F1-CB-001 C2 | ❌ Falla | `error_user` recibe la alerta "Sorting is broken!" al ordenar |
| F1-CB-001 C3 | ✅ Pasa | — |
| F2-CN-001 | ✅ Pasa | — |
| F2-CN-002 | ✅ Pasa | — |
| F2-CN-003 | ✅ Pasa | — |
| F2-BE-001 | ❌ Falla | `problem_user` no puede agregar al carrito productos como Sauce Labs Bolt T-Shirt |
| F3-CN-001 | ✅ Pasa | — |
| F3-CN-002 | ✅ Pasa | — |
| F3-BE-001 | ❌ Falla | Con `problem_user`, escribir en Last Name sobrescribe First Name |
| F3-BE-002 | ❌ Falla | La aplicación permite iniciar el checkout con el carrito vacío |

## 6. Evidencias y reporte

- Cada prueba guarda capturas de pantalla en `playwright-tests/evidencias/` con el ID del caso (por ejemplo `F2-CN-001_PASS.png`, `F2-BE-001_FAIL.png`, `F3-CN-001-confirmacion.png`).
- `npx playwright show-report` abre el reporte HTML con el resumen de pruebas aprobadas y fallidas y el detalle de cada assertion (valor esperado vs. obtenido).
- El diseño completo de los casos (precondiciones, datos, pasos, resultados esperados y defectos) está en el archivo Excel de casos de prueba entregado con el informe.

## 7. Solución de problemas

| Problema | Solución |
|---|---|
| "la ejecución de scripts está deshabilitada" | Ver el comando `Set-ExecutionPolicy` de la sección 1 |
| Error de versión en `npm install` | Instalar Node.js 24.9.0 o superior |
| Todas las pruebas fallan por timeout | La aplicación no está corriendo: ejecutar `npm run start` |
| "Port 3000 is already in use" | Cerrar la otra aplicación que usa el puerto 3000 |
| `Cannot find module './helpers'` | Falta `tests/helpers.js`: ejecutar `git pull` |
| "Executable doesn't exist" | Ejecutar `npx playwright install chrome` |

---

# Documentación original del proyecto

# What is this codebase?
This is the Sauce Labs Sample Application which is designed to be used from desktop web browsers

![sample-app-web workflow](https://github.com/saucelabs/sample-app-web/actions/workflows/sample-app-web.yml/badge.svg)

- [Setup](#setup)
  - [Requirements](#requirements)
  - [Build](#build)
  - [Storybook](#storybook)
- [Test](#test)
- [Deploy](#deploy)

## Setup
### Requirements
To set up the development environment directly on your host computer:

1. You'll need [Node.js](http://nodejs.org) `>=24.9.0` installed (see `.nvmrc`/`package.json` `engines` — this is a hard requirement of the Sauce Visual Storybook integration, not just a preference). If you don't have Node installed,
we recommend installing [NVM](https://github.com/creationix/nvm) to assist managing multiple active Node.js versions (`nvm use` will pick up `.nvmrc` automatically).
1. Install [Google Chrome](https://www.google.com/chrome/) for running the end-to-end tests locally
1. Clone the project somewhere on your computer

        git clone git@github.com:<your-username>/sample-app-web.git

1. Install all dependencies by running this command from the **root of the project**

        npm install

### Error reporting with Backtrace
To set up error reporting with your Backtrace instance:

1. Open `src/index.jsx` file and find the `BacktraceClient.initialize` function call:
    ```tsx
    BacktraceClient.initialize({
        name: 'Swag Store',
        version: '3.0.0',
        url: 'https://submit.backtrace.io/UNIVERSE/TOKEN/json',
        userAttributes: () => ({
            user: currentUser(),
            shoppingCart: ShoppingCart.getCartContents()
        })
    })
    ```
1. Replace `UNIVERSE` and `TOKEN` in `url` with your universe and token. 

For more details, [see the docs about React integration with Backtrace](https://docs.saucelabs.com/error-reporting/language-integrations/react/).

### Build
1. Build the application with

        npm run start

    This starts the Vite dev server, opens Chrome, and loads the website on [http://localhost:3000/](http://localhost:3000/)

1. Click around - this is the app!

### Sourcemaps in error reporting with Backtrace
To enable additional insight in Backtrace, you can send built sourcemaps and sources to Backtrace:
1. Open `.backtracejsrc` file
1. Replace `UNIVERSE` and `TOKEN` in `upload.url` with your universe and token.
1. Build the application with

        npm run build

1. Run `backtrace-js`

        npm run backtrace.sourcemaps

1. Serve the production build (sourcemaps integration won't work with `npm run start`, which serves unbuilt source)

        npm run preview

1. New uploaded errors should display with sourcemaps attached!

For more details, [see the docs about sourcemap integration with Backtrace](https://docs.saucelabs.com/error-reporting/platform-integrations/source-map/).

### Storybook
This website uses components which can be tested with Storybook. To run Storybook execute the following command:

    npm run storybook 

This will open Storybook on [http://localhost:6006/](http://localhost:6006/). More information about Storybook can be 
found [here](https://storybook.js.org/docs/react/get-started/introduction).

## Test
### E2E
The E2E suite lives in `test/e2e` (a separate npm project using WebdriverIO 9 + Chrome, driven by the bundled `chromedriver` package — no separate Selenium server or Java install needed). Install its dependencies once:

    npm --prefix ./test/e2e install

#### Testing locally
Make sure the application is running on [http://localhost:3000/](http://localhost:3000/) (see above steps), then:

    npm --prefix ./test/e2e run test.local

This will run the application test suite against your local Chrome.

#### Testing on Sauce Labs
Running on Sauce Labs uses Environment Variables to authenticate credentials. You can find a guide on how to do this
[here.](https://wiki.saucelabs.com/display/DOCS/Best+Practice%3A+Use+Environment+Variables+for+Authentication+Credentials)

1. `npm --prefix ./test/e2e run test.saucelabs.us` to run tests on the Sauce Labs US Data Center
2. `npm --prefix ./test/e2e run test.saucelabs.eu` to run tests on the Sauce Labs EU Data Center

> Make sure you've added the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` variables to your environment variables.

### Visual Component Testing
Components are visually tested with [Sauce Visual's Storybook integration](https://docs.saucelabs.com/visual-testing/integrations/storybook/) (`@saucelabs/visual-storybook`):

    npm run test.storybook

This builds on Storybook's own [test runner](https://github.com/storybookjs/test-runner) to visit every story with Playwright (across `chromium`, `firefox`, and `webkit` — see `test-runner-jest.config.mjs`), take a snapshot, and upload it to Sauce Visual for review/diffing. Requires Node `>=24.9.0` (see Requirements above).

Each PR (any branch other than `main`) will also run this in CI.

> Make sure you've added the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` variables to your environment variables.

## Deploy

Merges to main need to manually be triggered in [Actions > github pages release](https://github.com/saucelabs/sample-app-web/actions/workflows/github-pages.yml) and will automatically deploy to:
* https://www.saucedemo.com
* https://saucelabs.github.io/sample-app-web/

See: [.github/workflows/github-pages.yml GitHub Action](.github/workflows/github-pages.yml)
