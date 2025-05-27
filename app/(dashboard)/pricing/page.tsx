import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import Link from 'next/link';
import { PricingLines } from '@/components/pricing-lines';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const products = await getStripeProducts();

  return (
    <main className="max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-2">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-xl text-gray-700 mb-4">Überprüfte Adresse</h2>
        <div className="grid grid-cols-[120px_1fr] gap-y-2 text-gray-600">
          <div className="text-right pr-4 font-bold">PLZ</div>
          <div>88682</div>
          <div className="text-right pr-4 font-bold">Ort</div>
          <div>Salem</div>
          <div className="text-right pr-4 font-bold">Ortsteil</div>
          <div>Mittelstenweiler</div>
          <div className="text-right pr-4 font-bold">Straße</div>
          <div>Am Hungerberg</div>
          <div className="text-right pr-4 font-bold">Hausnummer</div>
          <div>1</div>
          <div className="text-right pr-4 font-bold">Hausnummernzusatz</div>
          <div></div>
        </div>
      </div>
      <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex">
            <div className="text-orange-400 mr-2">▶</div>
            <div className="text-gray-600 text-sm">
              <p>Hinweis: Hierbei handelt es sich um eine Vorbestellung eines GLASFASER.home-Tarifs. Dieses Produkt kann erst nach erfolgtem Glasfaserausbau bereitgestellt werden. Hierfür ist zusätzlich das Produkt GLASFASER Gebäudeanschluss (siehe dazu die <Link href="#" className="text-blue-600 hover:underline">Leistungsbeschreibung</Link>) vom Hauseigentümer zu beauftragen. Bitte kontaktieren Sie uns zur Beauftragung des GLASFASER Gebäudeanschlusses per <span className="font-semibold">E-Mail an </span>
              <Link href="mailto:glasfaser@netcom-bw.de" className="text-blue-600 hover:underline">glasfaser@netcom-bw.de</Link>.
              </p>
          </div>
        </div>
      </div>
      <div className="p-6 border-b border-gray-200 bg-white">
        <p className="text-gray-600 mb-4">An Ihrer Adresse sind folgende Produkte verfügbar:</p>
        <PricingLines products={products} />
      </div>
      <div className="p-6 border-b border-gray-200 bg-white">
        <p>
          Bitte beachten Sie, dass die Online-Bestellung ausschließlich für private Neukunden möglich ist.
        </p>  
        <p>
          Wenn Sie Ihren bestehenden NetCom BW Vertrag ändern möchten, können Sie den Wechsel über das Kundenportal beauftragen.
        </p>  
        <p>
          Wenn Sie von NeckarCom zu NetCom BW wechseln möchten, finden Sie alle Informationen hier.
        </p>  
        <p>
          Gewerbliche Anfragen werden von der Geschäftskundenbetreuung bearbeitet. Bitte wenden Sie sich in diesem Fall direkt an die E-Mail-Adresse <Link href="mailto:kmu@netcom-bw.de" className="text-blue-600 hover:underline">kmu@netcom-bw.de</Link>.
        </p>  
        <p>
          Bei dem Ergebnis der Verfügbarkeitsprüfung an Ihrer überprüften Adresse handelt es sich um keine verbindliche Zusage über die Möglichkeit des Anschlusses. Eine Abweichung im Rahmen der Leistungsbereitstellung bleibt vorbehalten.
        </p>
      </div>
    </main>
  );
}
