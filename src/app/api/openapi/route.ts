// src/app/api/openapi/route.ts
import { NextResponse } from "next/server";
import openapiSpec from "@/openapi";

export function GET() {
  return NextResponse.json(openapiSpec);
}
