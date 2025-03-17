'use server'
import { createNextRouteHandler } from '@flowglad/nextjs/server'
import { flowgladServer } from '@/lib/flowglad'

const routeHandler = createNextRouteHandler(flowgladServer)

export { routeHandler as GET, routeHandler as POST }
