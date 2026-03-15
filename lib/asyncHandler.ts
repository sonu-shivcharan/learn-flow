import { handleError } from "@/lib/handlerError"
import { NextRequest } from "next/server"
type RouteContext<T = Record<string, never>> = {
  params: Promise<T>
}
export function asyncHandler<T = Record<string, never>>(
  handler: (req: NextRequest, context: RouteContext<T>) => Promise<Response>
) {
  return async function (req: NextRequest, context: RouteContext<T>) {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleError(error)
    }
  }
}
