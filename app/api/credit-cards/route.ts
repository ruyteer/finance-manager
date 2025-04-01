import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { CreditCard } from "@/lib/types";

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function GET() {
  try {
    const result = await sql`
      SELECT data FROM credit_cards
    `;

    const creditCards = result.map((row) => row.data as CreditCard);
    return NextResponse.json(creditCards);
  } catch (error) {
    console.error("Error fetching credit cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const creditCard = (await request.json()) as CreditCard;

    await sql`
      INSERT INTO credit_cards (id, data)
      VALUES (${creditCard.id}, ${JSON.stringify(creditCard)})
    `;

    return NextResponse.json(creditCard);
  } catch (error) {
    console.error("Error creating credit card:", error);
    return NextResponse.json(
      { error: "Failed to create credit card" },
      { status: 500 }
    );
  }
}
