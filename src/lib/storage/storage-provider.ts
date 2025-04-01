// Interface para provedores de armazenamento
export interface StorageProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
}

// Implementação para localStorage
export class LocalStorageProvider implements StorageProvider {
  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Implementação para Neon Database
export class NeonDatabaseProvider implements StorageProvider {
  constructor(private connectionString: string) {}

  async getItem<T>(key: string): Promise<T | null> {
    try {
      // Importação dinâmica para evitar problemas no lado do cliente
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(this.connectionString);

      // Extrair o nome da tabela da chave
      const tableName = this.getTableNameFromKey(key);

      // Buscar todos os itens da tabela
      const result = await sql`SELECT id, data FROM ${tableName}`;

      if (!result || result.length === 0) return null;

      // Converter os resultados para o formato esperado
      return result.map((row) => row.data) as unknown as T;
    } catch (error) {
      console.error(
        `Erro ao buscar dados do Neon Database para a chave ${key}:`,
        error
      );
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      // Importação dinâmica para evitar problemas no lado do cliente
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(this.connectionString);

      // Extrair o nome da tabela da chave
      const tableName = this.getTableNameFromKey(key);

      // Limpar a tabela existente
      await sql`TRUNCATE ${tableName}`;

      // Se o valor for um array, inserir cada item
      if (Array.isArray(value)) {
        for (const item of value) {
          await sql`INSERT INTO ${tableName} (id, data) VALUES (${
            item.id
          }, ${JSON.stringify(item)})`;
        }
      }
    } catch (error) {
      console.error(
        `Erro ao salvar dados no Neon Database para a chave ${key}:`,
        error
      );
    }
  }

  // Função auxiliar para extrair o nome da tabela da chave
  private getTableNameFromKey(key: string): string {
    // Mapear as chaves para os nomes das tabelas
    const keyToTableMap: Record<string, string> = {
      "finance-app-transactions": "transactions",
      "finance-app-credit-cards": "credit_cards",
      "finance-app-receivables": "receivables",
    };

    return keyToTableMap[key] || key.replace("finance-app-", "");
  }
}

// Classe de serviço de dados genérica
export class DataService<T extends { id: string }> {
  constructor(
    private storageProvider: StorageProvider,
    private storageKey: string
  ) {}

  async getAll(): Promise<T[]> {
    return (await this.storageProvider.getItem<T[]>(this.storageKey)) || [];
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  async add(item: T): Promise<T> {
    const items = await this.getAll();
    items.push(item);
    await this.storageProvider.setItem(this.storageKey, items);
    return item;
  }

  async update(item: T): Promise<T> {
    const items = await this.getAll();
    const index = items.findIndex((i) => i.id === item.id);

    if (index === -1) {
      throw new Error(`Item with id ${item.id} not found`);
    }

    items[index] = item;
    await this.storageProvider.setItem(this.storageKey, items);
    return item;
  }

  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    const filteredItems = items.filter((item) => item.id !== id);
    await this.storageProvider.setItem(this.storageKey, filteredItems);
  }
}
