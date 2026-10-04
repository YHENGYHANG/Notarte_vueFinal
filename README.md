# Inventory Management System

A Vue 3 + Vue Router single-page app for tracking stock. It runs entirely in the browser and saves everything to `localStorage`, so there is no server or database to set up.

## Quick start

You need **Node.js 18 or newer** (check with `node -v`).

```bash
# 1. unzip, then open the folder
cd inventory-management-system

# 2. install dependencies (first time only)
npm install

# 3. start the dev server (opens http://localhost:5173)
npm run dev
```

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Demo accounts

| Role         | Username | Password   | Can do                                                                  |
| ------------ | -------- | ---------- | ----------------------------------------------------------------------- |
| Admin        | `admin`  | `admin123` | Everything                                                              |
| Regular user | `staff`  | `staff123` | View dashboard and inventory, add items, adjust stock (+ / -), read the guide |

## Who can do what

| Action                               | Admin | User |
| ------------------------------------ | :---: | :--: |
| See the dashboard                    |  Yes  | Yes  |
| Browse and search inventory          |  Yes  | Yes  |
| Add new items                        |  Yes  | Yes  |
| Adjust stock counts (+ / -)          |  Yes  | Yes  |
| Read the project guide               |  Yes  | Yes  |
| Edit item details and prices         |  Yes  |  No  |
| Delete items                         |  Yes  |  No  |
| Create, edit, delete categories      |  Yes  |  No  |
| Manage user accounts                 |  Yes  |  No  |

The table lives in one place, `src/utils/permissions.js`, and is enforced in four layers:

1. **Router guard** (`src/router/index.js`) redirects to `/login` or `/forbidden`.
2. **Navigation** hides links the role cannot open.
3. **Templates** use `v-if="can('items:delete')"` to hide buttons.
4. **Composables** (`useInventory`, `useUsers`) re-check the permission before changing data.

## Where each concept is used

| Concept                          | Files                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Form handling                    | `composables/useForm.js`, `components/inventory/ItemForm.vue`, `components/users/UserForm.vue`, `views/LoginView.vue` |
| Emitting events                  | `ItemCard.vue`, `ItemTable.vue`, `ItemForm.vue`, `SearchBar.vue`, `BaseModal.vue`, `AttentionList.vue`       |
| Parent and child communication   | `InventoryView` ↔ `ItemFilters` / `ItemCard`; `ItemEditorView` ↔ `ItemForm` (template ref + `defineExpose`); `App.vue` → sidebar and topbar (`provide` / `inject`) |
| Route configuration              | `router/index.js`: lazy loading, nested routes, `:id` params as props, `meta`, guards, redirect, 404, `onBeforeRouteLeave` |
| Composition API vs Options API   | Options: `views/CategoriesView.vue`, `components/categories/CategoryForm.vue`. Composition: every other file. Side-by-side examples are on the in-app **Project guide** page. |
| Mixins and composables           | Mixins: `mixins/formatMixin.js`, `mixins/confirmMixin.js`. Their composable twins: `useFormat.js`, `useConfirm.js`. Other composables: `useLocalStorage`, `useAuth`, `useUsers`, `useInventory`, `useInventoryFilters`, `useToast`, `useForm` |
| Local storage                    | `composables/useLocalStorage.js` (a ref that saves itself)                                                    |
| CRUD                             | Items (`useInventory`), categories (`CategoriesView`), users (`UsersView`)                                    |
| Role-based access                | `utils/permissions.js` plus the four layers above                                                             |

## Project structure

```
inventory-management-system/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.js                    app entry: router, fonts, global CSS
    ├── App.vue                    layout shell, provides sidebar state
    ├── config.js                  app name, currency, locale, storage prefix
    ├── injectionKeys.js           provide/inject keys
    ├── assets/
    │   ├── hero-warehouse.svg     login illustration
    │   ├── products/              category illustrations (electronics, furniture, ...)
    │   └── styles/main.css        design tokens and shared styles
    ├── router/index.js            routes, meta, navigation guards
    ├── composables/               useLocalStorage, useAuth, useUsers, useInventory,
    │                              useInventoryFilters, useForm, useConfirm, useToast, useFormat
    ├── mixins/                    formatMixin, confirmMixin (Options API)
    ├── data/seed.js               first-run sample data
    ├── utils/                     permissions, stock, format, images
    ├── components/
    │   ├── layout/                AppSidebar, AppTopbar
    │   ├── common/                BaseIcon, BaseModal, ConfirmDialog, ToastHost,
    │   │                          SearchBar, StockMeter, RoleBadge
    │   ├── inventory/             ItemCard, ItemTable, ItemFilters, ItemForm
    │   ├── dashboard/             StatStrip, AttentionList, CategoryBreakdown, ActivityFeed
    │   ├── categories/            CategoryForm (Options API)
    │   └── users/                 UserForm
    └── views/                     Login, Dashboard, Inventory, ItemDetail, ItemEditor,
                                   Categories (Options API), Users, Guide, Forbidden, NotFound
```

## Routes

| Path                  | Name          | Access            |
| --------------------- | ------------- | ----------------- |
| `/login`              | `login`       | Signed-out only   |
| `/`                   | `dashboard`   | Any signed-in user |
| `/inventory`          | `inventory`   | Any signed-in user |
| `/inventory/new`      | `item-new`    | Any signed-in user |
| `/inventory/:id`      | `item-detail` | Any signed-in user |
| `/inventory/:id/edit` | `item-edit`   | Admin              |
| `/categories`         | `categories`  | Admin              |
| `/users`              | `users`       | Admin              |
| `/guide`              | `guide`       | Any signed-in user |
| `/forbidden`          | `forbidden`   | Shown on denied access |

## Responsive layout

- All sizes use `rem`, `em` and `%`, so the layout follows the browser zoom (Ctrl/Cmd and + / -) and the window width.
- Breakpoints are written in `em`, so they also react to zoom: zooming in behaves like a narrower screen.
- The sidebar becomes a slide-in drawer below 60em, the inventory grid reflows with `auto-fill`, and tables turn into stacked rows on phones.

## localStorage keys

Data is stored under these keys (all prefixed with `ims:`): `items`, `categories`, `users`, `session`, `activity`, `inventory-prefs`.

To start over, open the browser dev tools, go to **Application → Local Storage**, and delete the `ims:*` keys. An admin can also use **Project guide → Reset inventory**.

## Notes

- Uploaded item photos are resized to 480 px and saved as JPEG data URLs, so they fit inside the roughly 5 MB localStorage limit.
- Passwords are stored as plain text because this is a front-end-only demo. A real app needs a backend that hashes passwords and checks permissions on the server too.
- Change the currency in `src/config.js` (`CURRENCY` and `LOCALE`).
