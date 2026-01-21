"use client";

import { PermissionGuard } from "@/components/admin-route-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Construction } from "lucide-react";

function ClaudeChatPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Claude AI</CardTitle>
          </div>
          <CardDescription>
            Anthropic'in gelişmiş yapay zeka asistanı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Construction className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Yakında Geliyor
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Claude AI entegrasyonu şu anda geliştirilme aşamasında. Çok yakında kullanıma hazır olacak!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaudePage() {
  return (
    <PermissionGuard requiredPermission="claude.read">
      <ClaudeChatPage />
    </PermissionGuard>
  );
}
