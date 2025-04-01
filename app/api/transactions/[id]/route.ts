import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { Transaction } from "@/lib/types";

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const transaction = (await request.json()) as Transaction;

    // Verificar se o ID na URL corresponde ao ID no corpo
    if (id !== transaction.id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    // Atualizar a transação
    await sql`
      UPDATE transactions
      SET data = ${JSON.stringify(transaction)}
      WHERE id = ${id}
    `;

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
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

    // Excluir a transação
    await sql`
      DELETE FROM transactions
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
