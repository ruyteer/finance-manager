import DataMigration from "@/components/admin/data-migration";
import { DbStatusCheck } from "@/components/admin/db-status-check";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
      <div className="container mx-auto p-4 relative z-10">
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Administração do Sistema
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DataMigration />
          </div>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Database className="mr-2 h-5 w-5 text-cyan-500" />
                Status do Banco de Dados
              </CardTitle>
              <CardDescription className="text-slate-400">
                Verifique a conexão com o Neon Database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DbStatusCheck />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
