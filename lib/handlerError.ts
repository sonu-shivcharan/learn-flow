import { MongooseError } from "mongoose"

import { JOSEError } from "jose/errors"
import { ApiResponse } from "./ApiResponse"
import { ApiError } from "./ApiError"

export function handleError(error: unknown) {
  console.log("error", error)
  if (error instanceof MongooseError) {
    return ApiResponse.error(error.message, 400)
  }
  if (error instanceof ApiError) {
    console.log("Api ERROR  : ", error)
    return ApiResponse.error(error.message, error.statusCode, error.errors)
  }
  if (error instanceof JOSEError) {
    return ApiResponse.error(error.message, 401, error.stack)
  }
  const message =
    error instanceof Error ? error.message : "Internal server error"
  return ApiResponse.error(message, 500)
}
