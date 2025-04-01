import type { StorageProvider } from "./storage-provider";

// Verificar se a variável de ambiente NEON_DATABASE_URL está disponível
let storageProvider: StorageProvider;

// Função para criar o provider apropriado
export async function getStorageProvider(): Promise<StorageProvider> {
  // Se já temos um provider, retorná-lo
  if (storageProvider) {
    return storageProvider;
  }

  // Verificar se estamos no servidor e se a variável de ambiente está disponível
  if (process.env.NEON_DATABASE_URL) {
    try {
      // Importar o NeonDatabaseProvider dinamicamente
      const { NeonDatabaseProvider } = await import("./storage-provider");
      storageProvider = new NeonDatabaseProvider(process.env.NEON_DATABASE_URL);
      console.log("Using Neon Database for storage");
      return storageProvider;
    } catch (error) {
      console.error("Error initializing Neon Database provider:", error);
    }
  }

  // Fallback para localStorage
  const { LocalStorageProvider } = await import("./storage-provider");
  storageProvider = new LocalStorageProvider();
  console.log("Using LocalStorage for storage");
  return storageProvider;
}
