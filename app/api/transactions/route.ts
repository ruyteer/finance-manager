import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { Transaction } from "@/lib/types";

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function GET() {
  try {
    const result = await sql`
      SELECT data FROM transactions
    `;

    const transactions = result.map((row) => row.data as Transaction);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const transaction = (await request.json()) as Transaction;

    await sql`
      INSERT INTO transactions (id, data)
      VALUES (${transaction.id}, ${JSON.stringify(transaction)})
    `;

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
