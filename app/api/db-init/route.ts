import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/storage/db-init";

export async function GET() {
  try {
    const success = await initializeDatabase();

    if (success) {
      return NextResponse.json({
        status: "success",
        message: "Banco de dados inicializado com sucesso!",
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "Falha ao inicializar o banco de dados",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Falha ao inicializar o banco de dados",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
