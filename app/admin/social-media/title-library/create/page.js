'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as socialMediaService from '@/lib/services/social-media-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Folder,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/admin-route-guard';

export default function CreateDatasetPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Lütfen dataset adı girin');
      return;
    }

    setCreating(true);
    try {
      const data = await socialMediaService.createDataset({
        name: name.trim(),
        description: description.trim(),
        platforms: [],
        categories: [],
        platformCounts: {},
        categoryCounts: {},
        status: 'active'
      });

      toast.success('Dataset oluşturuldu! Şimdi başlık üretmeye başlayabilirsiniz.');
      router.push(`/admin/social-media/title-library/${data.id}`);
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Dataset oluşturulamadı');
    } finally {
      setCreating(false);
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
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                    <Folder className="h-7 w-7 text-white" />
                  </div>
                  Yeni Dataset Oluştur
                </h1>
                <p className="text-gray-600 mt-2 ml-14">
                  Sosyal medya başlıklarınızı organize etmek için yeni bir dataset oluşturun
                </p>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Dataset Bilgileri
                </h2>
                <p className="text-sm text-gray-500">Dataset'iniz için açıklayıcı bir isim ve açıklama girin. Platform ve kategori seçimlerini detay sayfasında yapabilirsiniz.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Dataset Adı *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Örn: Şubat 2025 Kozmetik Kampanyası"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Açıklama (Opsiyonel)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Dataset hakkında kısa bir açıklama yazın..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 rounded-xl p-3">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Başlık Üretimi Nasıl Çalışır?</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Dataset oluşturduktan sonra detay sayfasına yönlendirileceksiniz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>İstediğiniz kategoriler ve platformlar için başlık üretebilirsiniz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Toplu üretim özellikleri ile tek seferde birçok başlık oluşturabilirsiniz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Tüm başlıklar dataset içinde organize edilir</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-12 px-6 rounded-xl"
              disabled={creating}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={creating || !name.trim()}
              className="h-12 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {creating ? 'Oluşturuluyor...' : 'Dataset Oluştur ve Başlıkları Üretmeye Başla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </PermissionGuard>
  );
}
