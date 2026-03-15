import { NextResponse } from "next/server"
import { ZodError, z } from "zod/v4"

export type APIErrorDetail =
  | ZodError
  | typeof Error
  | Record<string, string[]>
  | string[]
  | string
  | unknown
export class ApiResponse {
  static success<T>(message: string, data?: T, status: number = 200) {
    return NextResponse.json({ success: true, message, data }, { status })
  }
  static error(message: string, status: number = 400, errors?: APIErrorDetail) {
    console.log("message", message)
    return NextResponse.json({ success: false, message, errors }, { status })
  }

  static zodError(error: ZodError) {
    console.error("Zod validation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Validation error",
        errors: z.treeifyError(error),
      },
      { status: 400 }
    )
  }
}
