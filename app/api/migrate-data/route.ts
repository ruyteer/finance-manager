import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const { transactions, creditCards, receivables } = await request.json();
    const sql = neon(process.env.NEON_DATABASE_URL!);

    // Limpar tabelas existentes
    await sql`TRUNCATE transactions, credit_cards, receivables`;

    // Inserir transações
    if (transactions && transactions.length > 0) {
      for (const transaction of transactions) {
        await sql`
          INSERT INTO transactions (id, data)
          VALUES (${transaction.id}, ${JSON.stringify(transaction)})
        `;
      }
    }

    // Inserir cartões de crédito
    if (creditCards && creditCards.length > 0) {
      for (const card of creditCards) {
        await sql`
          INSERT INTO credit_cards (id, data)
          VALUES (${card.id}, ${JSON.stringify(card)})
        `;
      }
    }

    // Inserir valores a receber
    if (receivables && receivables.length > 0) {
      for (const receivable of receivables) {
        await sql`
          INSERT INTO receivables (id, data)
          VALUES (${receivable.id}, ${JSON.stringify(receivable)})
        `;
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Dados migrados com sucesso!",
      counts: {
        transactions: transactions?.length || 0,
        creditCards: creditCards?.length || 0,
        receivables: receivables?.length || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao migrar dados:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Falha ao migrar dados",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
