import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { ReceivableAmount } from "@/lib/types";

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const receivable = (await request.json()) as ReceivableAmount;

    // Verificar se o ID na URL corresponde ao ID no corpo
    if (id !== receivable.id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    // Atualizar o valor a receber
    await sql`
      UPDATE receivables
      SET data = ${JSON.stringify(receivable)}
      WHERE id = ${id}
    `;

    return NextResponse.json(receivable);
  } catch (error) {
    console.error("Error updating receivable:", error);
    return NextResponse.json(
      { error: "Failed to update receivable" },
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

    // Excluir o valor a receber
    await sql`
      DELETE FROM receivables
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receivable:", error);
    return NextResponse.json(
      { error: "Failed to delete receivable" },
      { status: 500 }
    );
  }
}
