"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Bot,
  Settings,
  Sparkles,
  Wand2,
  Brain,
  Lightbulb,
  Target,
  Clock,
  Hash,
  Type,
  Globe,
  Zap,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  TestTube,
  Play,
  Palette,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Key,
  Database,
  Cpu,
  Monitor,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";
import Link from "next/link";

// AI Provider Options
const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI GPT",
    models: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
    icon: Bot,
    description: "OpenAI'ın güçlü dil modelleri"
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    icon: Brain,
    description: "Anthropic'in Claude AI modeli"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-pro", "gemini-ultra"],
    icon: Sparkles,
    description: "Google'ın Gemini AI modeli"
  }
];

// Content Categories
const CONTENT_CATEGORIES = [
  { id: "promotional", name: "Promosyonal", icon: Target, color: "bg-blue-500" },
  { id: "educational", name: "Eğitsel", icon: Lightbulb, color: "bg-green-500" },
  { id: "engagement", name: "Etkileşim", icon: Zap, color: "bg-purple-500" },
  { id: "news", name: "Haber", icon: Globe, color: "bg-red-500" },
  { id: "lifestyle", name: "Yaşam Tarzı", icon: Users, color: "bg-pink-500" },
  { id: "behind_scenes", name: "Sahne Arkası", icon: MessageSquare, color: "bg-orange-500" }
];

// Platform-specific settings
const PLATFORM_CONFIGS = {
  instagram: { name: "Instagram", icon: Instagram, maxLength: 2200, color: "from-purple-500 to-pink-500" },
  facebook: { name: "Facebook", icon: Facebook, maxLength: 63206, color: "from-blue-600 to-blue-700" },
  twitter: { name: "Twitter", icon: Twitter, maxLength: 280, color: "from-sky-400 to-sky-600" },
  linkedin: { name: "LinkedIn", icon: Linkedin, maxLength: 3000, color: "from-blue-700 to-blue-800" },
  youtube: { name: "YouTube", icon: Youtube, maxLength: 5000, color: "from-red-500 to-red-600" }
};

// Default AI Templates
const DEFAULT_TEMPLATES = [
  {
    id: "promotional_product",
    name: "Ürün Tanıtımı",
    category: "promotional",
    prompt: "Yeni bir ürün için heyecan verici ve ikna edici bir sosyal medya postu oluştur. Ürünün faydalarını vurgulay ve satın almaya teşvik et.",
    variables: ["ürün_adı", "fiyat", "özellikler"],
    platforms: ["instagram", "facebook", "twitter"]
  },
  {
    id: "educational_tips",
    name: "İpuçları Paylaşımı",
    category: "educational",
    prompt: "Değerli ipuçları ve bilgiler içeren eğitsel bir post oluştur. Takipçilere faydalı olacak pratik bilgiler ver.",
    variables: ["konu", "ipuçları"],
    platforms: ["linkedin", "facebook"]
  },
  {
    id: "engagement_question",
    name: "Soru Sorma",
    category: "engagement",
    prompt: "Takipçilerin yorum yapmasını ve etkileşime girmesini teşvik eden bir soru postu oluştur. Samimi ve merak uyandırıcı olmalı.",
    variables: ["konu", "soru_türü"],
    platforms: ["instagram", "facebook", "twitter"]
  }
];

export default function SocialMediaAISettingsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  
  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    provider: "openai",
    model: "gpt-4",
    apiKey: "",
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: "Sen sosyal medya için içerik üreten profesyonel bir asistansın. Türkçe, yaratıcı ve etkileşimli içerikler oluştur.",
    autoHashtags: true,
    maxHashtags: 10,
    autoMentions: false,
    contentStyle: "professional",
    languages: ["tr", "en"]
  });

  // Template Settings
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "",
    prompt: "",
    variables: [],
    platforms: []
  });

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState({
    instagram: { enabled: true, autoPost: false, bestTimes: ["09:00", "18:00", "21:00"] },
    facebook: { enabled: true, autoPost: false, bestTimes: ["09:00", "13:00", "15:00"] },
    twitter: { enabled: true, autoPost: false, bestTimes: ["08:00", "12:00", "17:00"] },
    linkedin: { enabled: true, autoPost: false, bestTimes: ["09:00", "12:00", "17:00"] },
    youtube: { enabled: false, autoPost: false, bestTimes: ["20:00", "21:00"] }
  });

  // Analytics Settings
  const [analyticsSettings, setAnalyticsSettings] = useState({
    trackEngagement: true,
    trackClicks: true,
    trackConversions: false,
    reportFrequency: "weekly",
    autoOptimization: false
  });

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load settings from your backend/database
      // This is a placeholder - implement actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const settings = {
        ai: aiSettings,
        platforms: platformSettings,
        analytics: analyticsSettings,
        templates: templates,
        updatedAt: new Date(),
        updatedBy: user.uid
      };

      // Save to your backend/database
      // This is a placeholder - implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess("Ayarlar başarıyla kaydedildi!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Template management
  const openTemplateDialog = (template = null) => {
    if (template) {
      setTemplateForm(template);
      setSelectedTemplate(template);
    } else {
      setTemplateForm({
        name: "",
        category: "",
        prompt: "",
        variables: [],
        platforms: []
      });
      setSelectedTemplate(null);
    }
    setShowTemplateDialog(true);
  };

  const saveTemplate = () => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id 
          ? { ...templateForm, id: selectedTemplate.id }
          : t
      ));
    } else {
      // Add new template
      const newTemplate = {
        ...templateForm,
        id: `template_${Date.now()}`,
        createdAt: new Date()
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setShowTemplateDialog(false);
  };

  const deleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  // Test AI Generation
  const testAIGeneration = async () => {
    try {
      setError(null);
      const response = await fetch('/api/ai/test-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          model: aiSettings.model,
          prompt: "Test için kısa bir sosyal medya postu oluştur",
          settings: aiSettings
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Test başarılı! Oluşturulan içerik: "${data.content}"`);
      } else {
        throw new Error('Test başarısız');
      }
    } catch (err) {
      setError('AI test başarısız: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="blog.write">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/social-media">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bot className="h-7 w-7 text-blue-500" />
                AI Sosyal Medya Ayarları
              </h1>
              <p className="text-gray-600">
                Yapay zeka destekli içerik üretimi ve otomasyon ayarları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testAIGeneration}
            >
              <TestTube className="h-4 w-4 mr-2" />
              AI Test Et
            </Button>
            <Button
              size="sm"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Başarılı</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">🤖 Genel AI</TabsTrigger>
            <TabsTrigger value="templates">📝 Şablonlar</TabsTrigger>
            <TabsTrigger value="platforms">📱 Platformlar</TabsTrigger>
            <TabsTrigger value="automation">⚡ Otomasyon</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analitik</TabsTrigger>
          </TabsList>

          {/* General AI Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Provider Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Sağlayıcısı
                  </CardTitle>
                  <CardDescription>
                    Kullanılacak yapay zeka modelini seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Provider Selection */}
                  <div className="space-y-3">
                    <Label>AI Sağlayıcısı</Label>
                    <div className="grid gap-3">
                      {AI_PROVIDERS.map((provider) => {
                        const Icon = provider.icon;
                        const isSelected = aiSettings.provider === provider.id;
                        
                        return (
                          <div
                            key={provider.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setAiSettings(prev => ({
                              ...prev,
                              provider: provider.id,
                              model: provider.models[0]
                            }))}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-blue-500" />
                              <div>
                                <h4 className="font-medium">{provider.name}</h4>
                                <p className="text-sm text-gray-600">{provider.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select 
                      value={aiSettings.model}
                      onValueChange={(value) => setAiSettings(prev => ({ ...prev, model: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS
                          .find(p => p.id === aiSettings.provider)
                          ?.models.map(model => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Anahtarı
                    </Label>
                    <Input
                      type="password"
                      placeholder="API anahtarınızı girin..."
                      value={aiSettings.apiKey}
                      onChange={(e) => setAiSettings(prev => ({ 
                        ...prev, 
                        apiKey: e.target.value 
                      }))}
                    />
                    <p className="text-xs text-gray-500">
                      API anahtarınız güvenli bir şekilde saklanır
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Generation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Üretim Ayarları
                  </CardTitle>
                  <CardDescription>
                    İçerik üretimi için detaylı ayarlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <Label>Maksimum Token Sayısı</Label>
                    <Input
                      type="number"
                      min="100"
                      max="4000"
                      value={aiSettings.maxTokens}
                      onChange={(e) => setAiSettings(prev => ({ 
                        ...prev, 
                        maxTokens: parseInt(e.target.value) 
                      }))}
                    />
                    <p className="text-xs text-gray-500">
                      Üretilecek içeriğin maksimum uzunluğu
                    </p>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <Label>Yaratıcılık Seviyesi ({aiSettings.temperature})</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings(prev => ({ 
                        ...prev, 
                        temperature: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tutarlı</span>
                      <span>Yaratıcı</span>
                    </div>
                  </div>

                  {/* Content Style */}
                  <div className="space-y-2">
                    <Label>İçerik Stili</Label>
                    <Select 
                      value={aiSettings.contentStyle}
                      onValueChange={(value) => setAiSettings(prev => ({ 
                        ...prev, 
                        contentStyle: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Profesyonel</SelectItem>
                        <SelectItem value="casual">Rahat</SelectItem>
                        <SelectItem value="funny">Eğlenceli</SelectItem>
                        <SelectItem value="educational">Eğitsel</SelectItem>
                        <SelectItem value="inspiring">İlhami</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Auto Features */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Otomatik hashtag üret</Label>
                      <Switch
                        checked={aiSettings.autoHashtags}
                        onCheckedChange={(checked) => setAiSettings(prev => ({ 
                          ...prev, 
                          autoHashtags: checked 
                        }))}
                      />
                    </div>

                    {aiSettings.autoHashtags && (
                      <div className="space-y-2">
                        <Label>Maksimum Hashtag Sayısı</Label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={aiSettings.maxHashtags}
                          onChange={(e) => setAiSettings(prev => ({ 
                            ...prev, 
                            maxHashtags: parseInt(e.target.value) 
                          }))}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Otomatik etiketleme öner</Label>
                      <Switch
                        checked={aiSettings.autoMentions}
                        onCheckedChange={(checked) => setAiSettings(prev => ({ 
                          ...prev, 
                          autoMentions: checked 
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Sistem Promptu
                  </CardTitle>
                  <CardDescription>
                    AI'ın davranışını ve yazım stilini belirleyen temel talimat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={4}
                    placeholder="Sistem promptunuzu girin..."
                    value={aiSettings.systemPrompt}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      systemPrompt: e.target.value 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Bu prompt her içerik üretiminde kullanılır ve AI'ın genel davranışını belirler
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">İçerik Şablonları</h3>
                <p className="text-gray-600">
                  Farklı içerik türleri için hazır şablonlar oluşturun
                </p>
              </div>
              <Button onClick={() => openTemplateDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Şablon
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => {
                const category = CONTENT_CATEGORIES.find(c => c.id === template.category);
                const CategoryIcon = category?.icon || Type;
                
                return (
                  <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'} text-white`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {category?.name || 'Diğer'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openTemplateDialog(template)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {template.prompt}
                      </p>
                      
                      {/* Variables */}
                      {template.variables?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Değişkenler:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map(variable => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Platforms */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Platformlar:</p>
                        <div className="flex gap-1">
                          {template.platforms.map(platformId => {
                            const platform = PLATFORM_CONFIGS[platformId];
                            const PlatformIcon = platform?.icon;
                            return PlatformIcon ? (
                              <PlatformIcon key={platformId} className="h-4 w-4 text-gray-400" />
                            ) : null;
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Platform Ayarları</h3>
              <p className="text-gray-600">
                Her platform için özel ayarları yapılandırın
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(PLATFORM_CONFIGS).map(([platformId, config]) => {
                const Icon = config.icon;
                const settings = platformSettings[platformId];
                
                return (
                  <Card key={platformId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span>{config.name}</span>
                          <p className="text-sm font-normal text-gray-600">
                            Maks. {config.maxLength} karakter
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Enable/Disable */}
                      <div className="flex items-center justify-between">
                        <Label>Platform Aktif</Label>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], enabled: checked }
                          }))}
                        />
                      </div>

                      {settings.enabled && (
                        <>
                          {/* Auto Post */}
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Otomatik Yayınlama</Label>
                              <p className="text-xs text-gray-500">
                                Onaylanmış postları otomatik yayınla
                              </p>
                            </div>
                            <Switch
                              checked={settings.autoPost}
                              onCheckedChange={(checked) => setPlatformSettings(prev => ({
                                ...prev,
                                [platformId]: { ...prev[platformId], autoPost: checked }
                              }))}
                            />
                          </div>

                          {/* Best Times */}
                          <div className="space-y-2">
                            <Label>En İyi Yayın Saatleri</Label>
                            <div className="flex flex-wrap gap-2">
                              {settings.bestTimes.map((time, index) => (
                                <Badge key={index} variant="secondary">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Otomasyon Ayarları</h3>
              <p className="text-gray-600">
                İçerik oluşturma ve yayınlama otomasyonu
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Generation Automation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    İçerik Üretimi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Günlük otomatik içerik</Label>
                      <p className="text-sm text-gray-500">
                        Her gün belirtilen saatte içerik öner
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Trend konular takibi</Label>
                      <p className="text-sm text-gray-500">
                        Güncel konulardan içerik öner
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rekabet analizi</Label>
                      <p className="text-sm text-gray-500">
                        Rakip içeriklerinden ilham al
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Publishing Automation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Yayınlama Otomasyonu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Optimal zaman hesaplama</Label>
                      <p className="text-sm text-gray-500">
                        En iyi yayın zamanını AI hesaplasın
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cross-platform paylaşım</Label>
                      <p className="text-sm text-gray-500">
                        Tüm platformlarda aynı anda paylaş
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>A/B test otomasyonu</Label>
                      <p className="text-sm text-gray-500">
                        Farklı versiyonları test et
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Response Automation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Yanıt Otomasyonu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Otomatik yanıt önerisi</Label>
                      <p className="text-sm text-gray-500">
                        Yorumlara AI yanıt önerisi
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Emoji önerileri</Label>
                      <p className="text-sm text-gray-500">
                        Uygun emoji önerisi yap
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Spam filtreleme</Label>
                      <p className="text-sm text-gray-500">
                        Zararlı yorumları otomatik filtrele
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Learning & Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Öğrenme & Optimizasyon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performans öğrenimi</Label>
                      <p className="text-sm text-gray-500">
                        Başarılı içeriklerden öğren
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Stil adaptasyonu</Label>
                      <p className="text-sm text-gray-500">
                        Zamanla yazım stilini geliştir
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Kişiselleştirme</Label>
                      <p className="text-sm text-gray-500">
                        Takipçi davranışına göre özelleştir
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Analitik Ayarları</h3>
              <p className="text-gray-600">
                Performans takibi ve raporlama ayarları
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tracking Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Takip Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Etkileşim takibi</Label>
                    <Switch
                      checked={analyticsSettings.trackEngagement}
                      onCheckedChange={(checked) => setAnalyticsSettings(prev => ({
                        ...prev,
                        trackEngagement: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Tıklama takibi</Label>
                    <Switch
                      checked={analyticsSettings.trackClicks}
                      onCheckedChange={(checked) => setAnalyticsSettings(prev => ({
                        ...prev,
                        trackClicks: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Dönüşüm takibi</Label>
                    <Switch
                      checked={analyticsSettings.trackConversions}
                      onCheckedChange={(checked) => setAnalyticsSettings(prev => ({
                        ...prev,
                        trackConversions: checked
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Reporting Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Raporlama
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rapor sıklığı</Label>
                    <Select
                      value={analyticsSettings.reportFrequency}
                      onValueChange={(value) => setAnalyticsSettings(prev => ({
                        ...prev,
                        reportFrequency: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Günlük</SelectItem>
                        <SelectItem value="weekly">Haftalık</SelectItem>
                        <SelectItem value="monthly">Aylık</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Otomatik optimizasyon</Label>
                    <Switch
                      checked={analyticsSettings.autoOptimization}
                      onCheckedChange={(checked) => setAnalyticsSettings(prev => ({
                        ...prev,
                        autoOptimization: checked
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
              </DialogTitle>
              <DialogDescription>
                İçerik üretimi için kullanılacak şablonu yapılandırın
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Şablon Adı</Label>
                <Input
                  placeholder="Şablon adını girin..."
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={templateForm.category}
                  onValueChange={(value) => setTemplateForm(prev => ({
                    ...prev,
                    category: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  rows={4}
                  placeholder="AI'ya verilecek prompt talimatını yazın..."
                  value={templateForm.prompt}
                  onChange={(e) => setTemplateForm(prev => ({
                    ...prev,
                    prompt: e.target.value
                  }))}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateDialog(false)}
                >
                  İptal
                </Button>
                <Button 
                  onClick={saveTemplate}
                  disabled={!templateForm.name || !templateForm.category || !templateForm.prompt}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}