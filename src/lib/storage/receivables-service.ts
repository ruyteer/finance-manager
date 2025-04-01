import type { ReceivableAmount } from "@/lib/types";

// Função para buscar todos os valores a receber
export async function getReceivables(): Promise<ReceivableAmount[]> {
  try {
    const response = await fetch("/api/receivables");
    if (!response.ok) {
      throw new Error(`Error fetching receivables: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch receivables:", error);
    return [];
  }
}

// Função para buscar um valor a receber por ID
export async function getReceivableById(
  id: string
): Promise<ReceivableAmount | null> {
  try {
    const receivables = await getReceivables();
    return receivables.find((r) => r.id === id) || null;
  } catch (error) {
    console.error(`Failed to fetch receivable with id ${id}:`, error);
    return null;
  }
}

// Função para adicionar um valor a receber
export async function addReceivable(
  receivable: ReceivableAmount
): Promise<ReceivableAmount> {
  try {
    const response = await fetch("/api/receivables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receivable),
    });

    if (!response.ok) {
      throw new Error(`Error adding receivable: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to add receivable:", error);
    throw error;
  }
}

// Função para atualizar um valor a receber
export async function updateReceivable(
  receivable: ReceivableAmount
): Promise<ReceivableAmount> {
  try {
    const response = await fetch(`/api/receivables/${receivable.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receivable),
    });

    if (!response.ok) {
      throw new Error(`Error updating receivable: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Failed to update receivable with id ${receivable.id}:`,
      error
    );
    throw error;
  }
}

// Função para excluir um valor a receber
export async function deleteReceivable(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/receivables/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error deleting receivable: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Failed to delete receivable with id ${id}:`, error);
    throw error;
  }
}

// Funções adicionais específicas para valores a receber
export async function getPendingReceivables(): Promise<ReceivableAmount[]> {
  try {
    const receivables = await getReceivables();
    return receivables.filter((r) => !r.received);
  } catch (error) {
    console.error("Failed to fetch pending receivables:", error);
    return [];
  }
}

export async function getReceivedAmounts(): Promise<ReceivableAmount[]> {
  try {
    const receivables = await getReceivables();
    return receivables.filter((r) => r.received);
  } catch (error) {
    console.error("Failed to fetch received amounts:", error);
    return [];
  }
}
