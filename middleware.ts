/**
 * middleware.ts — Edge Middleware Next.js (root del progetto)
 *
 * Eseguito sull'edge prima di ogni richiesta.
 * Responsabilità:
 *   1. Redirect da DB (slug personalizzati 301/302/307/308)
 *   2. Protezione route private e admin con verifica JWT (no DB)
 *   3. Refresh automatico del cookie di sessione
 *
 * La verifica RBAC completa (ruoli/permessi) avviene nei Server Component
 * tramite requireAdminPage() in lib/rbac/guards.ts — questo middleware
 * si limita a verificare che esista un JWT valido e non scaduto.
 */
export { proxy as middleware, config } from "@/proxy";
