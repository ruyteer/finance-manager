import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);

    // Testar a conexão com uma consulta simples
    const result = await sql`SELECT NOW() as time`;

    return NextResponse.json({
      status: "success",
      message: "Conexão com Neon Database estabelecida com sucesso!",
      serverTime: result[0].time,
    });
  } catch (error) {
    console.error("Erro ao conectar com o Neon Database:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Falha ao conectar com o Neon Database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
