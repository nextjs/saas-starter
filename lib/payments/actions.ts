'use server'
import { withTeam } from '@/lib/auth/middleware'
import { flowgladServer } from '../flowglad'

export const checkoutAction = withTeam(async (formData, team) => {
  const variantId = formData.get('variantId') as string
  await flowgladServer.createPurchaseSession({
    variantId: variantId,
    successUrl: `${process.env.BASE_URL}/dashboard`,
    cancelUrl: `${process.env.BASE_URL}/dashboard`,
  })
})
