import type { CreditCard } from "@/lib/types";

// Função para buscar todos os cartões de crédito
export async function getCreditCards(): Promise<CreditCard[]> {
  try {
    const response = await fetch("/api/credit-cards");
    if (!response.ok) {
      throw new Error(`Error fetching credit cards: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch credit cards:", error);
    return [];
  }
}

// Função para buscar um cartão de crédito por ID
export async function getCreditCardById(
  id: string
): Promise<CreditCard | null> {
  try {
    const creditCards = await getCreditCards();
    return creditCards.find((c) => c.id === id) || null;
  } catch (error) {
    console.error(`Failed to fetch credit card with id ${id}:`, error);
    return null;
  }
}

// Função para adicionar um cartão de crédito
export async function addCreditCard(
  creditCard: CreditCard
): Promise<CreditCard> {
  try {
    const response = await fetch("/api/credit-cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creditCard),
    });

    if (!response.ok) {
      throw new Error(`Error adding credit card: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to add credit card:", error);
    throw error;
  }
}

// Função para atualizar um cartão de crédito
export async function updateCreditCard(
  creditCard: CreditCard
): Promise<CreditCard> {
  try {
    const response = await fetch(`/api/credit-cards/${creditCard.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creditCard),
    });

    if (!response.ok) {
      throw new Error(`Error updating credit card: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Failed to update credit card with id ${creditCard.id}:`,
      error
    );
    throw error;
  }
}

// Função para excluir um cartão de crédito
export async function deleteCreditCard(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/credit-cards/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error deleting credit card: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Failed to delete credit card with id ${id}:`, error);
    throw error;
  }
}
