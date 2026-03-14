import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: string;
  message: string;
};

export function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json<ApiErrorBody>({ error, message }, { status });
}

export function successResponse<T>(status: number, payload: T) {
  return NextResponse.json(payload, { status });
}
