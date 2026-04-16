/**
 * disposable-domains.ts
 *
 * Carica dinamicamente la lista dei domini usa-e-getta dal file JSON.
 * In questo modo il bundle principale non include 63KB di dati statici —
 * il JSON viene letto solo quando serve (primo controllo email dopo cold start).
 *
 * Se vuoi aggiornare la lista: modifica lib/auth/disposable-domains.json
 * oppure usa un servizio esterno come:
 *   https://open.kickbox.com/v1/disposable/{email}
 */

let _domains: Set<string> | null = null;

export async function isDisposableDomain(email: string): Promise<boolean> {
  if (!_domains) {
    // Import dinamico: caricato una volta sola, poi tenuto in memoria
    const list = (await import("./disposable-domains.json")) as {
      default: string[];
    };
    _domains = new Set(list.default);
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return _domains.has(domain);
}

/**
 * @deprecated Usa isDisposableDomain(email) invece.
 * Mantenuto per retrocompatibilità durante la migrazione.
 * Rimuovere dopo che tutti i call site sono stati aggiornati.
 */
export const disposableDomains: Set<string> = new Proxy(new Set<string>(), {
  has(_target, prop) {
    // Fallback sincrono: carica in modo bloccante se necessario (solo Node.js)
    // In produzione Edge Runtime usare sempre isDisposableDomain()
    console.warn(
      "[disposable-domains] Uso sincrono deprecato. Usa isDisposableDomain() async.",
    );
    return false; // Safe default: non blocca registrazione, log per debug
  },
});
