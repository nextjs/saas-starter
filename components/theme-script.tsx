// Disalin dari skill app-builder (assets/theme/).
// Dipasang di <head> pada src/app/layout.tsx:
//
//   <head><ThemeScript /></head>
//
// Script ini jalan SEBELUM React hydrate. Tanpa ini, layar berkedip putih dulu
// saat mode gelap ("FOUC"). Jangan diganti dengan useEffect.

const script = `
(function () {
  try {
    var stored = localStorage.getItem('theme');           // 'light' | 'dark' | 'system' | null
    var dark = stored === 'dark'
      || ((stored === 'system' || !stored)
          && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
