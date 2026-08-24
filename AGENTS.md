# Agent Instructions: Angular Shop (ARCHIVED)

## ⚠️ Architectural Deprecation Notice
`astoreforbeauty.com` and `astore4beauty.com` **NO LONGER USE ANGULAR OR THIS REPOSITORY**.

All storefront views, product catalogs, category filtering, cart & checkout modals, verified customer review modules, beauty bundles, and route handlers have been **fully migrated to Native React MVC architecture** inside `multiDomainCMS`:
- **View Components**: `/home/robert/projects/multipleDomainCMS/src/views/astoreforbeauty.com/`
- **Route Controller**: `/home/robert/projects/multipleDomainCMS/src/routes/domains/astoreforbeauty.com.ts`

---

## 🚫 Workflow Invariants
1. **Do NOT Make Edits in This Repository**: All active e-commerce storefront development for `astoreforbeauty.com` must be done directly within the `multiDomainCMS` repository.
2. **Do NOT Copy Artifacts**: Agents must never run `ng build` here to copy artifacts into `multiDomainCMS/public/astoreforbeauty/angular-shop/`.
3. **Historical Archive Only**: This codebase is retained strictly as an immutable historical reference.
