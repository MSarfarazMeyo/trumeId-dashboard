---

# Brand Customization Guide

This branch allows you to create **new branded versions** of the project by updating environment variables. The branding is applied dynamically to the **logo, favicon, primary colors, and other UI elements** without modifying the codebase.

## Environment Variables

Update the `.env` file in the root of the project with your brand-specific values:

```env
# Brand Name
VITE_BRAND_NAME='Nobis'

# Favicon URL
VITE_BRAND_FAVICON='https://nobis-idv.s3.us-east-2.amazonaws.com/uploads/vite.svg'

# Logo URL (white logo recommended)
VITE_BRAND_LOGO='https://nobis-idv.s3.us-east-2.amazonaws.com/uploads/Nobis Logo - White 3.png'

# Primary brand colors
VITE_PRIMARY_DARK='#800080'
VITE_PRIMARY_LIGHT='#ca0bca'
```

### Notes:

* `VITE_BRAND_NAME` – The brand name used throughout the app.
* `VITE_BRAND_FAVICON` – URL of the favicon to display in the browser tab.
* `VITE_BRAND_LOGO` – URL of the logo image displayed on the landing page, header, and other locations. A **white/transparent logo** is recommended for consistent coloring.
* `VITE_PRIMARY_DARK` – Primary dark color used for backgrounds, gradients, and main buttons.
* `VITE_PRIMARY_LIGHT` – Primary light color used for headings, gradients, buttons, and places where a lighter shade is needed.

---

## How Branding Works

1. **Logo & Favicon**

   - The logo (`VITE_BRAND_LOGO`) is dynamically loaded into the app header and landing pages.
   - The favicon (`VITE_BRAND_FAVICON`) is automatically applied to the document head.

2. **Colors**

   - `VITE_PRIMARY_DARK` is used for **main backgrounds, buttons, and accents**.
   - `VITE_PRIMARY_LIGHT` is used for **lighter accents**, gradients, hover states, and headings.

3. **Brand Name**

   - The app will use `VITE_BRAND_NAME` wherever the brand name is displayed, including page titles and headers.

---

## Running the Branded App

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open the app in your browser. The app will automatically pick up the branding defined in `.env`.

---

## Adding a New Brand

To create a new brand:

1. Clone the project branch for branding.
2. Copy the `.env` file and update the variables with the new brand values.
3. Start the development server; the new brand’s **logo, favicon, colors, and name** will be reflected throughout the app.

> This approach avoids manual code changes and ensures that each brand can be maintained independently.

---
