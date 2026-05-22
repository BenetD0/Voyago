# Rendering Architecture

Use these folders to keep page-level rendering strategies predictable in the `pages` router:

- `src/architecture/client`
  For shared client-side infrastructure like polling or realtime helpers.
- `src/architecture/ssr`
  For `getServerSideProps` helpers and per-request authenticated pages.
- `src/architecture/srg`
  For plain static rendering helpers.
- `src/architecture/isr`
  For revalidated static pages.

Suggested pattern:

```ts
import { createIsrPageProps, createStaticPageProps, withServerSideAuth } from "@/architecture";
```
