// Componente para verificar o status do banco de dados
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function DbStatusCheck() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    async function checkDbStatus() {
      try {
        const response = await fetch("/api/db-test");
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
          setServerTime(data.serverTime);
        } else {
          setStatus("error");
          setMessage(data.message || "Erro ao conectar com o banco de dados");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      }
    }

    checkDbStatus();
  }, []);

  return (
    <div>
      {status === "loading" && (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="ml-2 text-slate-400">Verificando conexão...</span>
        </div>
      )}

      {status === "success" && (
        <Alert className="bg-green-900/20 text-green-400 border-green-500/50">
          <CheckCircle className="h-5 w-5 mr-2" />
          <div>
            <AlertTitle>Conexão estabelecida</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            {serverTime && (
              <p className="mt-2 text-sm">
                Hora do servidor: {new Date(serverTime).toLocaleString()}
              </p>
            )}
          </div>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-900/20 text-red-400 border-red-500/50">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="mt-4">
        <Button
          onClick={async () => {
            setStatus("loading");
            try {
              const response = await fetch("/api/db-init");
              const data = await response.json();
              if (response.ok) {
                setStatus("success");
                setMessage("Banco de dados inicializado com sucesso!");
              } else {
                setStatus("error");
                setMessage(
                  data.message || "Erro ao inicializar banco de dados"
                );
              }
            } catch (error) {
              setStatus("error");
              setMessage(
                error instanceof Error ? error.message : "Erro desconhecido"
              );
            }
          }}
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          Inicializar Banco de Dados
        </Button>
      </div>
    </div>
  );
}
