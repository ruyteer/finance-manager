"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Database,
  HardDrive,
  ArrowRightCircle,
} from "lucide-react";

export default function DataMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    counts?: {
      transactions: number;
      creditCards: number;
      receivables: number;
    };
  } | null>(null);

  const migrateData = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      // Coletar dados do localStorage
      const transactions = JSON.parse(
        localStorage.getItem("finance-app-transactions") || "[]"
      );
      const creditCards = JSON.parse(
        localStorage.getItem("finance-app-credit-cards") || "[]"
      );
      const receivables = JSON.parse(
        localStorage.getItem("finance-app-receivables") || "[]"
      );

      // Enviar dados para a API
      const response = await fetch("/api/migrate-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          creditCards,
          receivables,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          counts: data.counts,
        });
      } else {
        setResult({
          success: false,
          message: data.message || "Erro desconhecido ao migrar dados",
        });
      }
    } catch (error) {
      console.error("Erro ao migrar dados:", error);
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao migrar dados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center">
          <Database className="mr-2 h-5 w-5 text-cyan-500" />
          Migração de Dados
        </CardTitle>
        <CardDescription className="text-slate-400">
          Migre seus dados do localStorage para o Neon Database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex flex-col items-center">
            <HardDrive className="h-12 w-12 text-amber-500 mb-2" />
            <span className="text-sm text-slate-400">localStorage</span>
          </div>
          <ArrowRightCircle className="h-8 w-8 text-slate-500" />
          <div className="flex flex-col items-center">
            <Database className="h-12 w-12 text-cyan-500 mb-2" />
            <span className="text-sm text-slate-400">Neon Database</span>
          </div>
        </div>

        {result && (
          <Alert
            className={`mb-4 ${
              result.success
                ? "bg-green-900/20 text-green-400 border-green-500/50"
                : "bg-red-900/20 text-red-400 border-red-500/50"
            }`}
          >
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              )}
              <div>
                <AlertTitle>{result.success ? "Sucesso" : "Erro"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
                {result.success && result.counts && (
                  <div className="mt-2 text-sm">
                    <p>Transações migradas: {result.counts.transactions}</p>
                    <p>
                      Cartões de crédito migrados: {result.counts.creditCards}
                    </p>
                    <p>
                      Valores a receber migrados: {result.counts.receivables}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        <p className="text-slate-400 text-sm mb-4">
          Esta ferramenta irá migrar todos os seus dados financeiros do
          armazenamento local do navegador para o banco de dados Neon. Isso
          permitirá que você acesse seus dados de qualquer dispositivo e evite
          perder informações ao limpar o cache do navegador.
        </p>
        <p className="text-amber-400 text-sm mb-4">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Atenção: Esta ação não afetará seus dados no localStorage, mas
          substituirá quaisquer dados existentes no Neon Database.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={migrateData}
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          {isLoading ? "Migrando dados..." : "Migrar Dados para Neon Database"}
        </Button>
      </CardFooter>
    </Card>
  );
}
