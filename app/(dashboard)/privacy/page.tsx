export const metadata = {
  title: 'Personvernerklæring - PromptForbedring',
  description: 'Les vår personvernerklæring og lær hvordan vi beskytter dine data',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Personvernerklæring
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Innledning
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              PromptForbedring ("vi", "oss", "vår") respekterer ditt personvern og er forpliktet til
              å beskytte dine personopplysninger. Denne personvernerklæringen forklarer hvordan vi
              samler inn, bruker og beskytter dine data i samsvar med GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Data vi samler inn
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>E-postadresse og navn ved registrering</li>
              <li>Tekstene du sender inn for forbedring</li>
              <li>Bruksdata og statistikk</li>
              <li>Cookies og sporingstekno logier</li>
              <li>Betalingsinformasjon (behandlet av Stripe)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Hvordan vi bruker dine data
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Å tilby og forbedre våre tjenester</li>
              <li>Å behandle dine forespørsler om tekstforbedring</li>
              <li>Å kommunisere med deg om tjenesten</li>
              <li>Å sende nyhetsbrev (med ditt samtykke)</li>
              <li>Å overholde juridiske forpliktelser</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Dine rettigheter
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              I henhold til GDPR har du følgende rettigheter:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Rett til innsyn i dine personopplysninger</li>
              <li>Rett til retting av unøyaktige data</li>
              <li>Rett til sletting ("retten til å bli glemt")</li>
              <li>Rett til begrensning av behandling</li>
              <li>Rett til dataportabilitet</li>
              <li>Rett til å protestere mot behandling</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Datasikkerhet
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Vi implementerer passende tekniske og organisatoriske sikkerhetstiltak for å beskytte
              dine personopplysninger mot uautorisert tilgang, endring, avsløring eller ødeleggelse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Vi bruker cookies for å forbedre din opplevelse. Du kan velge å akseptere eller avvise
              cookies gjennom vår cookie-banner.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Kontakt oss
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Hvis du har spørsmål om denne personvernerklæringen eller ønsker å utøve dine
              rettigheter, vennligst kontakt oss på:{' '}
              <a href="mailto:privacy@promptforbedring.no" className="text-orange-500 hover:underline">
                privacy@promptforbedring.no
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
