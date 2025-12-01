"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as socialMediaService from "@/lib/services/social-media-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowLeft, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/admin-route-guard";

export default function CreateCalendarSetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Lütfen takvim seti adı girin");
      return;
    }

    try {
      setSaving(true);

      const calendarSet = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await socialMediaService.saveCalendarPlan(calendarSet);

      toast.success("Takvim seti oluşturuldu");
      router.push(`/admin/social-media/calendar-view/${result.id}`);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Takvim seti oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard requiredPermission="social_media.create">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  Yeni Takvim Seti
                </h1>
                <p className="text-gray-600 mt-2 ml-14">
                  Sosyal medya içerik planınız için yeni bir takvim seti
                  oluşturun
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-6 py-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Takvim Bilgileri
                </CardTitle>
                <CardDescription>
                  Takvim setiniz için temel bilgileri girin
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Takvim Seti Adı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Örn: Ocak 2024 İçerik Planı"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Takvim setinizi tanımlayan açıklayıcı bir isim verin
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-base font-semibold"
                  >
                    Açıklama <span className="text-gray-400">(Opsiyonel)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Bu takvim setinin amacı ve içeriği hakkında kısa bir açıklama yazın..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="text-base resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    Takvim setinin ne için kullanılacağını açıklayın
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-blue-50 border-blue-100">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="bg-blue-100 rounded-xl p-3 h-fit">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Takvim Seti Oluşturduktan Sonra
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Mevcut içeriklerinizi takvime ekleyebilirsiniz</li>
                      <li>• Yeni içerikler oluşturup planlayabilirsiniz</li>
                      <li>
                        • İçerikleri sürükle-bırak ile düzenleyebilirsiniz
                      </li>
                      <li>• Farklı platformlar için içerik görebilirsiniz</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                size="lg"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.name.trim()}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Takvim Setini Oluştur
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}
