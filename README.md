# BYTEFORGE — Gaming & Tech Store

A Thai-language Next.js App Router storefront and admin dashboard, styled with Tailwind CSS. Product data is served through Google Apps Script; admin uploads are committed to a GitHub repository.

## Run locally

1. Install Node.js 18.17+.
2. Copy `.env.example` to `.env.local` and set all five values. Keep `.env.local` private and never commit real tokens/passwords.
3. Run `npm install`, then `npm run dev`, and open http://localhost:3000.

## Environment variables

- `GOOGLE_SHEET_URL`: deployed Google Apps Script web app URL (execute as owner; accessible to the app).
- `GITHUB_TOKEN`: fine-grained GitHub token with **Contents: read and write** permission for the image repository.
- `GITHUB_OWNER`: owner/user of the image repository.
- `GITHUB_REPO`: repository name for images.
- `ADMIN_PASSWORD`: long, unique admin password.

The upload route accepts JPEG, PNG, WebP, or GIF files up to 5 MB. It uses random filenames and requires the admin password. Use HTTPS in production; the password is retained in browser localStorage as requested, so avoid shared/public devices.

## Google Apps Script contract

Deploy a web app whose `doGet` returns either an array of products or `{ "products": [...] }`. Each row uses `id`, `name`, `category`, `specs`, `price`, `stock`, `description`, and `image` (the API also accepts capitalized headers). `doPost` receives JSON:

- `{ "action": "add", "product": { ... } }`
- `{ "action": "update", "product": { ... } }`
- `{ "action": "delete", "id": "..." }`

Return JSON from `doPost`; the Apps Script endpoint should implement these operations against your sheet. The Next.js server checks the `x-admin-password` header before forwarding write actions. The storefront product list is public by design.

## Build

`npm run build` then `npm start`.
