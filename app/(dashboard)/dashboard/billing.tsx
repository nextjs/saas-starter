import { flowgladServer } from '@/lib/flowglad'
import { BillingPage as FlowgladBillingPage } from '@flowglad/nextjs'

export default async function BillingPage() {
  const billing = await flowgladServer.getBilling()
  return <FlowgladBillingPage billing={billing} />
}
