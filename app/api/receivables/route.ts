import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { ReceivableAmount } from "@/lib/types";

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function GET() {
  try {
    const result = await sql`
      SELECT data FROM receivables
    `;

    const receivables = result.map((row) => row.data as ReceivableAmount);
    return NextResponse.json(receivables);
  } catch (error) {
    console.error("Error fetching receivables:", error);
    return NextResponse.json(
      { error: "Failed to fetch receivables" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const receivable = (await request.json()) as ReceivableAmount;

    await sql`
      INSERT INTO receivables (id, data)
      VALUES (${receivable.id}, ${JSON.stringify(receivable)})
    `;

    return NextResponse.json(receivable);
  } catch (error) {
    console.error("Error creating receivable:", error);
    return NextResponse.json(
      { error: "Failed to create receivable" },
      { status: 500 }
    );
  }
}
