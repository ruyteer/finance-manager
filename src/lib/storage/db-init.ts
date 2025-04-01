import { neon } from "@neondatabase/serverless";

export async function initializeDatabase() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);

    // Criar tabelas separadamente
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS credit_cards (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS receivables (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )`;

    console.log("Tabelas inicializadas com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar tabelas:", error);
    return false;
  }
}
