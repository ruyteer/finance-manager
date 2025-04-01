import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { CreditCard } from "@/lib/types";

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const creditCard = (await request.json()) as CreditCard;

    // Verificar se o ID na URL corresponde ao ID no corpo
    if (id !== creditCard.id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    // Atualizar o cartão de crédito
    await sql`
      UPDATE credit_cards
      SET data = ${JSON.stringify(creditCard)}
      WHERE id = ${id}
    `;

    return NextResponse.json(creditCard);
  } catch (error) {
    console.error("Error updating credit card:", error);
    return NextResponse.json(
      { error: "Failed to update credit card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Excluir o cartão de crédito
    await sql`
      DELETE FROM credit_cards
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credit card:", error);
    return NextResponse.json(
      { error: "Failed to delete credit card" },
      { status: 500 }
    );
  }
}
