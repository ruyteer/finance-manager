import type { Transaction } from "@/lib/types";

// Função para buscar todas as transações
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch("/api/transactions");
    if (!response.ok) {
      throw new Error(`Error fetching transactions: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

// Função para buscar uma transação por ID
export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  try {
    const transactions = await getTransactions();
    return transactions.find((t) => t.id === id) || null;
  } catch (error) {
    console.error(`Failed to fetch transaction with id ${id}:`, error);
    return null;
  }
}

// Função para adicionar uma transação
export async function addTransaction(
  transaction: Transaction
): Promise<Transaction> {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error(`Error adding transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw error;
  }
}

// Função para atualizar uma transação
export async function updateTransaction(
  transaction: Transaction
): Promise<Transaction> {
  try {
    const response = await fetch(`/api/transactions/${transaction.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error(`Error updating transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Failed to update transaction with id ${transaction.id}:`,
      error
    );
    throw error;
  }
}

// Função para excluir uma transação
export async function deleteTransaction(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error deleting transaction: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Failed to delete transaction with id ${id}:`, error);
    throw error;
  }
}

// Funções adicionais específicas para transações
export async function getTransactionsByCreditCard(
  creditCardId: string
): Promise<Transaction[]> {
  try {
    const transactions = await getTransactions();
    return transactions.filter((t) => t.creditCardId === creditCardId);
  } catch (error) {
    console.error(
      `Failed to fetch transactions for credit card ${creditCardId}:`,
      error
    );
    return [];
  }
}

export async function getTransactionsByMonth(
  month: number,
  year: number
): Promise<Transaction[]> {
  try {
    const transactions = await getTransactions();
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  } catch (error) {
    console.error(
      `Failed to fetch transactions for month ${month} and year ${year}:`,
      error
    );
    return [];
  }
}

export async function getTransactionsByType(
  type: "income" | "expense"
): Promise<Transaction[]> {
  try {
    const transactions = await getTransactions();
    return transactions.filter((t) => t.type === type);
  } catch (error) {
    console.error(`Failed to fetch transactions of type ${type}:`, error);
    return [];
  }
}
