"use client";

import { SubmitButton } from "@/app/(dashboard)/pricing/submit-button";
import { checkoutAction } from "@/lib/payments/actions";
import Link from "next/link";
import { useState } from "react";

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  defaultPriceId?: string;
  metadata: { [key: string]: string };
}

const MAIN_PRODUCT = "prod_SMGAD37AwtPZEL";

export function PricingLines({ products }: { products: StripeProduct[] }) {
  const [selected, setSelected] = useState(MAIN_PRODUCT)
  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-gray-600 font-medium">Empfohlenes Produkt</div>
        </div>
        {products.filter(product => product.id === MAIN_PRODUCT && product.metadata != null).map((product) => (
          <PricingLine id={product.id} name={product.name} metadata={Object.values(product.metadata)} key={product.id} setSelected={setSelected} selected={selected} />
        ))}
      </div>
      
      <div className="mb-4">
        <div className="text-gray-600 font-medium mb-2">Alternative Produkte</div>
        {products.filter(product => product.id !== MAIN_PRODUCT).map((product) => (
          <PricingLine id={product.id} name={product.name} metadata={Object.values(product.metadata)} key={product.id} setSelected={setSelected} selected={selected} />
        ))}
      </div>

      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={products.find(product => product.id === selected)?.defaultPriceId} />
        <SubmitButton />
      </form>
    </>
  )
}

function PricingLine({ id, name, metadata, selected, setSelected }: { id: string, name: string, metadata: string[], selected: string, setSelected: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-start mb-2">
        <div className="mr-2 mt-1">
          <input type="radio" id={id} name="product" className="w-4 h-4 accent-orange-400" checked={selected === id} onChange={() => setSelected(id)}  />
        </div>
        <label htmlFor={id} className="text-gray-600">{name}</label>
      </div>
      
      {selected === id && (
        <div className="ml-6 pl-2 border-l-2 border-orange-400 mb-2">
          {metadata.map((value, metadataIndex) => (
            <div className="flex items-center text-gray-600 mb-1" key={metadataIndex}>
              <span className="text-orange-400 mr-2">▶</span>
              {value}
            </div>
          ))}
        </div>
      )}
      
      <div className="ml-6">
        <Link href="#" className="text-blue-600 hover:underline text-sm">Weitere Informationen</Link>
      </div>
    </div>
  )
}