"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AdminRouteGuard,
  PermissionGuard,
} from "@/components/admin-route-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Settings,
  Bot,
  FileText,
  Sliders,
  Plus,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  Download,
  Upload,
  Play,
  Check,
  X,
  Eye,
  Copy,
  Loader2,
  AlertTriangle,
  Info,
  Sparkles,
  Zap,
  Brain,
  Database,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  MessageSquare,
  Search,
  Layers,
} from "lucide-react";

import {
  getAiProviders,
  getAiModels,
  getAiPrompts,
  getAiConfigurations,
  updateAiProvider,
  createAiModel,
  updateAiModel,
  deleteAiModel,
  toggleModelStatus,
  createAiPrompt,
  updateAiPrompt,
  deleteAiPrompt,
  setAiConfiguration,
  exportAiSettings,
  importAiSettings,
  PROVIDER_INFO, // Fallback olarak kullanılıyor
  MODEL_CATEGORIES,
  PROMPT_CATEGORIES,
  USAGE_CONTEXTS,
} from "@/lib/services/ai-settings-service";

import {
  seedAiSettings,
  resetAiSettings,
  checkAiSettingsSeeded,
} from "@/lib/services/ai-settings-seed";

import { AI_CONTENT_SETTINGS } from "@/lib/ai-models";

import {
  seedAllPrompts,
  resetAllPrompts,
  updateConfigurationsWithPrompts,
  resetConfigurations,
  getPromptStatistics,
  PROMPT_CATEGORIES as SEED_PROMPT_CATEGORIES,
} from "@/lib/services/ai-prompts-seed";

import {
  seedCaseSummarySettings,
  checkCaseSummarySettingsSeeded,
} from "@/lib/services/crm-case-summary-seed";

import {
  seedFormulaPromptsV4,
  checkFormulaPromptsV4Seeded,
} from "@/lib/services/formula-prompts-v4";

// ============================================================================
// PROVIDER CARD COMPONENT
// ============================================================================

function ProviderCard({ provider, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setSaving] = useState(false);
  const [formData, setFormData] = useState(provider);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAiProvider(provider.id, formData);
      toast({
        title: "Başarılı",
        description: "Provider ayarları güncellendi",
      });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const info = PROVIDER_INFO[provider.id] || {};

  return (
    <Card
      className={`bg-white dark:bg-slate-900 border transition-all duration-200 hover:shadow-sm ${
        provider.isActive ? "border-emerald-200 dark:border-emerald-800" : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-2xl">{provider.icon || info.icon}</span>
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">{provider.name}</CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                {provider.description || info.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={provider.isActive 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
                : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }
            >
              {provider.isActive ? "Aktif" : "Pasif"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isEditing && (
        <CardContent className="space-y-4 pt-0">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-300">Varsayılan Model</Label>
                <Input
                  value={formData.defaultModel || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultModel: e.target.value })
                  }
                  placeholder="claude_haiku"
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex items-center space-x-3 pt-6">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label className="text-sm text-slate-600 dark:text-slate-300">Provider Aktif</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
              >
                İptal
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="text-sm text-slate-500 dark:text-slate-400 pt-0">
        <div className="flex items-center gap-4">
          <span className="text-xs">Env: <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">{provider.envKey || info.envKey}</code></span>
          {provider.website && (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs hover:underline"
            >
              Docs →
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// MODEL EDITOR DIALOG
// ============================================================================

function ModelEditorDialog({ model, providers, open, onOpenChange, onSave }) {
  // İlk provider'ı default olarak al (Firestore'dan gelen)
  const defaultProvider = providers?.[0]?.id || "claude";

  const [formData, setFormData] = useState(
    model || {
      provider: defaultProvider,
      name: "",
      displayName: "",
      apiId: "",
      description: "",
      icon: "🤖",
      isActive: true,
      order: 1,
      category: MODEL_CATEGORIES.CHAT,
      capabilities: {
        chat: true,
        vision: false,
        reasoning: false,
        codeGeneration: false,
      },
      limits: {
        maxTokens: 4096,
        contextWindow: 128000,
      },
      settings: {
        defaultTemperature: 0.7,
        defaultMaxTokens: 2048,
      },
    }
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (model) {
      setFormData(model);
    }
  }, [model]);

  const handleSave = async () => {
    if (!formData.name || !formData.apiId) {
      toast({
        title: "Hata",
        description: "Model adı ve API ID zorunludur",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (model?.id) {
        await updateAiModel(model.id, formData);
        toast({ title: "Başarılı", description: "Model güncellendi" });
      } else {
        await createAiModel(formData);
        toast({ title: "Başarılı", description: "Yeni model oluşturuldu" });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Brain className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            {model ? "Model Düzenle" : "Yeni Model Ekle"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">AI model tanımını düzenleyin</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(v) => setFormData({ ...formData, provider: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Firestore'dan gelen providers kullan */}
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.icon} {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODEL_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Model Adı</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Claude Haiku"
              />
            </div>

            <div className="space-y-2">
              <Label>Görünen Ad</Label>
              <Input
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Claude Haiku 4.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>API ID (Önemli!)</Label>
              <Input
                value={formData.apiId}
                onChange={(e) =>
                  setFormData({ ...formData, apiId: e.target.value })
                }
                placeholder="claude-haiku-4-5-20251001"
              />
            </div>

            <div className="space-y-2">
              <Label>İkon</Label>
              <Input
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="⚡"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Model açıklaması..."
              rows={2}
            />
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <Label>Yetenekler</Label>
            <div className="flex flex-wrap gap-4">
              {[
                "chat",
                "vision",
                "reasoning",
                "codeGeneration",
                "grounding",
                "imageGeneration",
              ].map((cap) => (
                <div key={cap} className="flex items-center gap-2">
                  <Switch
                    checked={formData.capabilities?.[cap] || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        capabilities: {
                          ...formData.capabilities,
                          [cap]: checked,
                        },
                      })
                    }
                  />
                  <Label className="text-sm">{cap}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Limits & Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={formData.limits?.maxTokens || 4096}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      maxTokens: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Context Window</Label>
              <Input
                type="number"
                value={formData.limits?.contextWindow || 128000}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      contextWindow: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Varsayılan Temperature</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.settings?.defaultTemperature || 0.7}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      defaultTemperature: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Sıralama</Label>
              <Input
                type="number"
                value={formData.order || 1}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label>Model Aktif</Label>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// PROMPT EDITOR DIALOG - Modern Design
// ============================================================================

function PromptEditorDialog({ prompt, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState(
    prompt || {
      key: "",
      name: "",
      description: "",
      category: PROMPT_CATEGORIES.GENERAL_ASSISTANT,
      context: "",
      systemPrompt: "",
      userPromptTemplate: "",
      variables: [],
      tags: [],
      language: "tr",
      isActive: true,
      version: "1.0",
      defaultSettings: {
        temperature: 0.7,
        maxTokens: 2048,
      },
    }
  );
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const { toast } = useToast();

  useEffect(() => {
    if (prompt) {
      setFormData({
        ...prompt,
        systemPrompt: prompt.systemPrompt || prompt.content || "",
        userPromptTemplate: prompt.userPromptTemplate || "",
        variables: prompt.variables || [],
        tags: prompt.tags || [],
        defaultSettings: prompt.defaultSettings || {
          temperature: 0.7,
          maxTokens: 2048,
        },
      });
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!formData.key || !formData.name || !formData.systemPrompt) {
      toast({
        title: "Hata",
        description: "Key, ad ve sistem prompt'u zorunludur",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // content alanını da güncelle (geriye uyumluluk için)
      const dataToSave = {
        ...formData,
        content: formData.systemPrompt,
      };

      if (prompt?.id) {
        await updateAiPrompt(prompt.id, dataToSave);
        toast({ title: "Başarılı", description: "Prompt güncellendi" });
      } else {
        await createAiPrompt(dataToSave);
        toast({ title: "Başarılı", description: "Yeni prompt oluşturuldu" });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            {prompt ? "Prompt Düzenle" : "Yeni Prompt Ekle"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            AI prompt şablonunu yapılandırın
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Section Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { id: "basic", label: "Temel Bilgiler", icon: Info },
              { id: "prompts", label: "Prompt İçeriği", icon: FileText },
              { id: "settings", label: "Ayarlar", icon: Settings },
            ].map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className={`gap-2 flex-1 ${
                  activeSection === section.id 
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </Button>
            ))}
          </div>

          {/* Basic Info Section */}
          {activeSection === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Benzersiz Key *</Label>
                  <Input
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({ ...formData, key: e.target.value })
                    }
                    placeholder="crm_reply_main"
                    disabled={!!prompt?.id}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prompt Adı *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="CRM Müşteri Yanıtı"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Açıklama</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Bu prompt ne için kullanılıyor..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROMPT_CATEGORIES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dil</Label>
                  <Select
                    value={formData.language || "tr"}
                    onValueChange={(v) =>
                      setFormData({ ...formData, language: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="multi">🌍 Multi-language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Versiyon</Label>
                  <Input
                    value={formData.version || "1.0"}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Context</Label>
                <Input
                  value={formData.context || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, context: e.target.value })
                  }
                  placeholder="blog_generation, crm_reply, vb."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Bu prompt'un hangi işlemde kullanılacağını belirtir
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">Prompt Aktif</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pasif prompt'lar kullanılamaz
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
          )}

          {/* Prompts Section */}
          {activeSection === "prompts" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    System Prompt *
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {formData.systemPrompt?.length || 0} karakter
                  </Badge>
                </div>
                <Textarea
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, systemPrompt: e.target.value })
                  }
                  placeholder="AI'ın rolünü ve davranışını tanımlayan sistem prompt'u..."
                  rows={10}
                  className="font-mono text-sm resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  AI'ın karakterini, bilgi tabanını ve yanıt stilini tanımlar
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    User Prompt Template
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {formData.userPromptTemplate?.length || 0} karakter
                  </Badge>
                </div>
                <Textarea
                  value={formData.userPromptTemplate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userPromptTemplate: e.target.value,
                    })
                  }
                  placeholder="Kullanıcı mesajı şablonu (opsiyonel)..."
                  rows={6}
                  className="font-mono text-sm resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Değişkenler için{" "}
                  <code className="bg-muted px-1 rounded">{`{{variableName}}`}</code>{" "}
                  formatını kullanın
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Değişkenler</Label>
                <Input
                  value={
                    Array.isArray(formData.variables)
                      ? formData.variables.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      variables: e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="topic, language, tone, ..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Virgülle ayırarak değişken isimlerini girin
                </p>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Temperature</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={formData.defaultSettings?.temperature || 0.7}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultSettings: {
                          ...formData.defaultSettings,
                          temperature: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = Tutarlı, 1 = Yaratıcı, 2 = Rastgele
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Tokens</Label>
                  <Input
                    type="number"
                    value={formData.defaultSettings?.maxTokens || 2048}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultSettings: {
                          ...formData.defaultSettings,
                          maxTokens: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimum yanıt uzunluğu
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Etiketler</Label>
                <Input
                  value={
                    Array.isArray(formData.tags) ? formData.tags.join(", ") : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="blog, seo, içerik, ..."
                />
                <p className="text-xs text-muted-foreground">
                  Prompt'u kategorize etmek için etiketler
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Kaynak Dosya</Label>
                <Input
                  value={formData.sourceFile || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceFile: e.target.value })
                  }
                  placeholder="lib/services/ai-blog-service.js"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Prompt'un orijinal kaynak dosyası (referans için)
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {prompt ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CONFIGURATION CARD - Modern Multi-Model Support
// ============================================================================

const CONTEXT_CONFIG = {
  admin_crm: {
    label: "CRM",
    icon: "💬",
    description: "Müşteri ilişkileri ve otomatik yanıtlar",
    color: "from-sky-400 to-blue-500",
    bgLight: "bg-sky-50",
    textColor: "text-sky-700",
  },
  admin_blog: {
    label: "Blog Üretimi",
    icon: "📝",
    description: "AI destekli blog içerik üretimi",
    color: "from-violet-400 to-purple-500",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
  },
  admin_social_media: {
    label: "Sosyal Medya",
    icon: "📱",
    description: "Sosyal medya içerik üretimi",
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
  },
  admin_content_studio: {
    label: "Content Studio",
    icon: "🎨",
    description: "Görsel ve metin içerik stüdyosu",
    color: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  admin_formulas: {
    label: "Formüller",
    icon: "🧪",
    description: "Kozmetik formül analizi",
    color: "from-rose-400 to-pink-500",
    bgLight: "bg-rose-50",
    textColor: "text-rose-700",
  },
  chat_gemini: {
    label: "Gemini Chat",
    icon: "🔵",
    description: "Gemini sohbet arayüzü",
    color: "from-blue-400 to-indigo-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
  },
  chat_chatgpt: {
    label: "ChatGPT Chat",
    icon: "🟢",
    description: "ChatGPT sohbet arayüzü",
    color: "from-green-400 to-emerald-500",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
  },
  api_image_generate: {
    label: "Görsel Üretim",
    icon: "🖼️",
    description: "AI görsel üretim API",
    color: "from-pink-400 to-rose-500",
    bgLight: "bg-pink-50",
    textColor: "text-pink-700",
  },
  service_image_selection: {
    label: "Görsel Seçim",
    icon: "🔍",
    description: "Akıllı görsel seçim servisi",
    color: "from-indigo-400 to-violet-500",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  service_title_generation: {
    label: "Başlık Üretimi",
    icon: "✨",
    description: "AI başlık üretim servisi",
    color: "from-yellow-400 to-amber-500",
    bgLight: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
};

function ConfigurationCard({ config, models, prompts, providers, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Provider bilgisini Firestore'dan al (helper fonksiyon)
  const getProviderInfo = (providerId) => {
    const provider = providers?.find((p) => p.id === providerId);
    return (
      provider || PROVIDER_INFO[providerId] || { icon: "⚪", name: providerId }
    );
  };

  // Eğer allowedModelIds boşsa ve defaultModelId varsa, defaultModelId'yi allowedModelIds'e ekle
  const initialAllowedIds =
    config.allowedModelIds && config.allowedModelIds.length > 0
      ? config.allowedModelIds
      : config.defaultModelId
      ? [config.defaultModelId]
      : [];

  const [formData, setFormData] = useState({
    ...config,
    allowedModelIds: initialAllowedIds,
    contentSettings: config.contentSettings || {
      creativity: 70,
      technicality: 60,
      seoOptimization: 80,
      readability: 75,
    },
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const contextInfo = CONTEXT_CONFIG[config.context] || {
    label: config.context,
    icon: "⚙️",
    description: config.description || "",
    color: "from-gray-500 to-slate-500",
  };

  // Model ekleme/çıkarma
  const toggleModel = (modelId) => {
    const currentIds = formData.allowedModelIds || [];
    const newIds = currentIds.includes(modelId)
      ? currentIds.filter((id) => id !== modelId)
      : [...currentIds, modelId];
    setFormData({ ...formData, allowedModelIds: newIds });
  };

  // Varsayılan model ayarlama
  const setDefaultModel = (modelId) => {
    setFormData({ ...formData, defaultModelId: modelId });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // context field'ını çıkar, zaten parametre olarak veriliyor
      const { context: _, ...dataToSave } = formData;
      // Document ID olarak config.id kullan (config.context değil!)
      // Firestore'da document ID ile context field'ı farklı olabilir
      const documentId = config.id || config.contextId || config.context;
      await setAiConfiguration(documentId, dataToSave);
      toast({ title: "Başarılı", description: "Konfigürasyon güncellendi" });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(formData) !==
    JSON.stringify({
      ...config,
      allowedModelIds: initialAllowedIds,
    });

  // Aktif model sayısı
  const allowedCount = formData.allowedModelIds?.length || 0;
  const defaultModel = models.find(
    (m) => m.modelId === formData.defaultModelId
  );

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${
        isExpanded ? "ring-1 ring-slate-300 dark:ring-slate-600 shadow-md" : "hover:shadow-sm"
      }`}
    >
      {/* Header - Always Visible */}
      <div
        className={`p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r ${contextInfo.color} bg-opacity-10`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/90 dark:bg-slate-800 rounded-xl shadow-sm">
              <span className="text-xl">{contextInfo.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white drop-shadow-sm">
                {config.name || contextInfo.label}
              </h3>
              <p className="text-xs text-white/90">
                {config.description || contextInfo.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allowedCount > 0 && (
              <Badge className="bg-white/25 text-white border-0 backdrop-blur-sm">
                {allowedCount} model
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
            >
              {isExpanded ? (
                <X className="h-4 w-4" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary - Always Visible */}
      {!isExpanded && (
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Varsayılan Model */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Varsayılan:</span>
                {defaultModel ? (
                  <Badge variant="outline" className="font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {defaultModel.icon}{" "}
                    {defaultModel.displayName || defaultModel.name}
                  </Badge>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 text-xs">Seçilmedi</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
                <Sliders className="h-3 w-3" />
                T:{formData.settings?.temperature || 0.7}
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="p-5 space-y-5">
          {/* Aktif Modeller Seçimi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Brain className="h-4 w-4 text-slate-500" />
                Kullanılabilir Modeller
              </Label>
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {allowedCount} seçili
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
              {Object.entries(
                models.reduce((acc, model) => {
                  const provider = model.provider || "other";
                  if (!acc[provider]) acc[provider] = [];
                  acc[provider].push(model);
                  return acc;
                }, {})
              ).map(([provider, providerModels]) => {
                const providerInfo = getProviderInfo(provider);
                return (
                  <div key={provider} className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                      {providerInfo.icon} {providerInfo.name}
                    </p>
                    {providerModels.map((model) => {
                      const isSelected = formData.allowedModelIds?.includes(
                        model.modelId
                      );
                      const isDefault =
                        formData.defaultModelId === model.modelId;

                      return (
                        <div
                          key={model.id}
                          className={`
                          flex items-center justify-between p-3 rounded-xl border transition-all
                          ${
                            isSelected
                              ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                          }
                        `}
                        >
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={isSelected}
                              onCheckedChange={() => toggleModel(model.modelId)}
                              className="scale-90"
                            />
                            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                              <span className="text-base">{model.icon}</span>
                            </div>
                            <div>
                              <p
                                className={`text-sm ${
                                  isSelected ? "font-medium text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {model.displayName || model.name}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                                {model.description?.slice(0, 40)}...
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <Button
                              variant={isDefault ? "default" : "outline"}
                              size="sm"
                              className={`h-7 text-xs rounded-lg ${
                                isDefault 
                                  ? "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900" 
                                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                              onClick={() => setDefaultModel(model.modelId)}
                            >
                              {isDefault ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Varsayılan
                                </>
                              ) : (
                                "Varsayılan Yap"
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="bg-slate-100 dark:bg-slate-800" />

          {/* Seçili Prompt */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sistem Prompt'u
            </Label>
            <Select
              value={formData.promptKey || "__none__"}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  promptKey: v === "__none__" ? null : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Prompt seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">Prompt yok</span>
                </SelectItem>
                {prompts
                  .filter((p) => p.key)
                  .map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.key}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {prompt.category}
                        </Badge>
                        {prompt.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Bazlı Prompt'lar - platformPrompts alanı varsa göster */}
          {formData.platformPrompts &&
            Object.keys(formData.platformPrompts).length > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <Label className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Layers className="h-4 w-4 text-slate-500" />
                  Platform Bazlı Prompt'lar
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Her platform için özel prompt seçimi yapabilirsiniz.
                </p>
                <div className="grid gap-3">
                  {Object.entries(formData.platformPrompts).map(
                    ([platform, promptKey]) => {
                      const platformLabels = {
                        instagram: {
                          label: "Instagram",
                          icon: "📸",
                          color: "pink",
                        },
                        facebook: {
                          label: "Facebook",
                          icon: "👍",
                          color: "blue",
                        },
                        x: { label: "X (Twitter)", icon: "𝕏", color: "gray" },
                        twitter: {
                          label: "X (Twitter)",
                          icon: "𝕏",
                          color: "gray",
                        },
                        linkedin: {
                          label: "LinkedIn",
                          icon: "💼",
                          color: "sky",
                        },
                      };
                      const platformInfo = platformLabels[platform] || {
                        label: platform,
                        icon: "📱",
                        color: "gray",
                      };

                      return (
                        <div key={platform} className="flex items-center gap-3">
                          <div className="w-28 flex items-center gap-2 text-sm">
                            <span>{platformInfo.icon}</span>
                            <span className="font-medium">
                              {platformInfo.label}
                            </span>
                          </div>
                          <Select
                            value={promptKey || "__none__"}
                            onValueChange={(v) =>
                              setFormData({
                                ...formData,
                                platformPrompts: {
                                  ...formData.platformPrompts,
                                  [platform]: v === "__none__" ? null : v,
                                },
                              })
                            }
                          >
                            <SelectTrigger className="flex-1 h-9">
                              <SelectValue placeholder="Prompt seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">
                                <span className="text-muted-foreground">
                                  Varsayılan prompt kullan
                                </span>
                              </SelectItem>
                              {prompts
                                .filter((p) => p.key)
                                .map((prompt) => (
                                  <SelectItem
                                    key={prompt.id}
                                    value={prompt.key}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {prompt.category}
                                      </Badge>
                                      {prompt.name}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* Kategori Bazlı Prompt'lar - categoryPrompts alanı varsa göster */}
          {formData.categoryPrompts &&
            Object.keys(formData.categoryPrompts).length > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <Label className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Layers className="h-4 w-4 text-slate-500" />
                  Kategori Bazlı Prompt'lar
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Her ürün kategorisi için özel prompt seçimi yapabilirsiniz.
                </p>
                <div className="grid gap-3">
                  {Object.entries(formData.categoryPrompts).map(
                    ([category, promptKey]) => {
                      const categoryLabels = {
                        cosmetic: {
                          label: "Kozmetik",
                          icon: "💄",
                          color: "pink",
                        },
                        dermocosmetic: {
                          label: "Dermokozmetik",
                          icon: "🧪",
                          color: "purple",
                        },
                        cleaning: {
                          label: "Temizlik",
                          icon: "🧹",
                          color: "blue",
                        },
                        supplement: {
                          label: "Gıda Takviyesi",
                          icon: "💊",
                          color: "green",
                        },
                      };
                      const categoryInfo = categoryLabels[category] || {
                        label: category,
                        icon: "📦",
                        color: "gray",
                      };

                      return (
                        <div key={category} className="flex items-center gap-3">
                          <div className="w-32 flex items-center gap-2 text-sm">
                            <span>{categoryInfo.icon}</span>
                            <span className="font-medium">
                              {categoryInfo.label}
                            </span>
                          </div>
                          <Select
                            value={promptKey || "__none__"}
                            onValueChange={(v) =>
                              setFormData({
                                ...formData,
                                categoryPrompts: {
                                  ...formData.categoryPrompts,
                                  [category]: v === "__none__" ? null : v,
                                },
                              })
                            }
                          >
                            <SelectTrigger className="flex-1 h-9">
                              <SelectValue placeholder="Prompt seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">
                                <span className="text-muted-foreground">
                                  Varsayılan prompt kullan
                                </span>
                              </SelectItem>
                              {prompts
                                .filter((p) => p.key)
                                .map((prompt) => (
                                  <SelectItem
                                    key={prompt.id}
                                    value={prompt.key}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {prompt.category}
                                      </Badge>
                                      {prompt.name}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* Ayarlar Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Temperature
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  className="h-9"
                  value={formData.settings?.temperature || 0.7}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        temperature: parseFloat(e.target.value),
                      },
                    })
                  }
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        0: Tutarlı, 1: Yaratıcı, 2: Rastgele
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Max Tokens
              </Label>
              <Input
                type="number"
                className="h-9"
                value={formData.settings?.maxTokens || 2048}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      maxTokens: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Content Settings - Blog için özel ayarlar */}
          {config.context === "admin_blog" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  İçerik Ayarları (Blog Üretimi)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(AI_CONTENT_SETTINGS).map(([key, setting]) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">
                          {setting.label}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {formData.contentSettings?.[key] || setting.default}%
                        </Badge>
                      </div>
                      <Input
                        type="range"
                        min={setting.min}
                        max={setting.max}
                        step={setting.step}
                        value={
                          formData.contentSettings?.[key] || setting.default
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contentSettings: {
                              ...formData.contentSettings,
                              [key]: parseInt(e.target.value),
                            },
                          })
                        }
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Ek Ayarlar */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.settings?.streaming || false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, streaming: checked },
                  })
                }
              />
              <Label className="text-sm">Streaming</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive !== false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label className="text-sm">Aktif</Label>
            </div>
          </div>

          {/* Kaydet Butonu */}
          {hasChanges && (
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({
                    ...config,
                    allowedModelIds: config.allowedModelIds || [],
                  })
                }
              >
                Sıfırla
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="min-w-[100px]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AiSettingsPage() {
  const [activeTab, setActiveTab] = useState("providers");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  // Legacy state'ler - eski fonksiyonlar için
  const [seedingPrompts, setSeedingPrompts] = useState(false);
  const [resettingPrompts, setResettingPrompts] = useState(false);
  const [resettingSettings, setResettingSettings] = useState(false);
  const [resettingConfigs, setResettingConfigs] = useState(false);

  // Data states
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [configurations, setConfigurations] = useState([]);

  // Dialog states
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);

  // Filter states
  const [providerFilter, setProviderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  // Helper: Provider bilgisini Firestore'dan al (fallback dahil)
  const getProviderInfo = useCallback(
    (providerId) => {
      const provider = providers.find((p) => p.id === providerId);
      return (
        provider ||
        PROVIDER_INFO[providerId] || { icon: "⚪", name: providerId }
      );
    },
    [providers]
  );

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [providersData, modelsData, promptsData, configsData, seeded] =
        await Promise.all([
          getAiProviders(),
          getAiModels(),
          getAiPrompts(),
          getAiConfigurations(),
          checkAiSettingsSeeded(),
        ]);

      setProviders(providersData);
      setModels(modelsData);
      setPrompts(promptsData);
      setConfigurations(configsData);
      setIsSeeded(seeded);
    } catch (error) {
      console.error("Error loading AI settings:", error);
      toast({
        title: "Hata",
        description: "AI ayarları yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================================
  // SEED & RESET HANDLERS - Birleşik Sistem
  // ============================================================================

  const [seedingAll, setSeedingAll] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);
  const [seedingCaseSummary, setSeedingCaseSummary] = useState(false);
  const [caseSummarySeeded, setCaseSummarySeeded] = useState(false);
  
  // Formula v4.0 seed states
  const [seedingFormulaV4, setSeedingFormulaV4] = useState(false);
  const [formulaV4Seeded, setFormulaV4Seeded] = useState({ allSeeded: false, seeded: 0, total: 4 });

  // CRM Case Summary seed durumunu kontrol et
  useEffect(() => {
    const checkCaseSummary = async () => {
      try {
        const isSeeded = await checkCaseSummarySettingsSeeded();
        setCaseSummarySeeded(isSeeded);
      } catch (error) {
        console.error("Case summary seed kontrolü hatası:", error);
      }
    };
    checkCaseSummary();
  }, []);

  // Formula v4.0 seed durumunu kontrol et
  useEffect(() => {
    const checkFormulaV4 = async () => {
      try {
        const result = await checkFormulaPromptsV4Seeded();
        setFormulaV4Seeded(result);
      } catch (error) {
        console.error("Formula v4 seed kontrolü hatası:", error);
      }
    };
    checkFormulaV4();
  }, []);

  /**
   * CRM CASE SUMMARY AYARLARINI YÜKLE
   */
  const handleSeedCaseSummary = async () => {
    setSeedingCaseSummary(true);
    try {
      const result = await seedCaseSummarySettings();
      if (result.success) {
        toast({
          title: "🎉 CRM Case Summary Ayarları Yüklendi!",
          description: result.message,
        });
        setCaseSummarySeeded(true);
        loadData();
      } else {
        throw new Error(result.error || "Bilinmeyen hata");
      }
    } catch (error) {
      console.error("CRM Case Summary seed hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSeedingCaseSummary(false);
    }
  };

  /**
   * FORMÜL V4.0 PROMPTLARINI YÜKLE
   */
  const handleSeedFormulaV4 = async () => {
    setSeedingFormulaV4(true);
    try {
      const result = await seedFormulaPromptsV4();
      if (result.success) {
        toast({
          title: "🎉 Formül v4.0 Prompt'ları Yüklendi!",
          description: result.message,
        });
        // Durumu güncelle
        const checkResult = await checkFormulaPromptsV4Seeded();
        setFormulaV4Seeded(checkResult);
        loadData();
      } else {
        throw new Error(result.error || "Bilinmeyen hata");
      }
    } catch (error) {
      console.error("Formula v4 seed hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSeedingFormulaV4(false);
    }
  };

  /**
   * TÜM AI VERİLERİNİ YÜKLE
   * - Providers, Models, Configurations (ai-settings-seed.js)
   * - Tüm Prompt'lar (ai-prompts-seed.js)
   */
  const handleSeedAll = async () => {
    setSeedingAll(true);
    try {
      // 1. Settings (providers, models, configs) yükle
      console.log("🔄 AI Settings yükleniyor...");
      const settingsResult = await seedAiSettings();

      // 2. Tüm prompt'ları yükle
      console.log("🔄 Prompt'lar yükleniyor...");
      const promptsResult = await seedAllPrompts();

      // 3. Konfigürasyonları prompt'larla güncelle
      console.log("🔄 Konfigürasyonlar güncelleniyor...");
      const configResult = await updateConfigurationsWithPrompts();

      if (settingsResult.success && promptsResult.success) {
        toast({
          title: "🎉 Tüm AI Verileri Yüklendi!",
          description: `${settingsResult.results.providers.success} provider, ${settingsResult.results.models.success} model, ${promptsResult.added} prompt, ${configResult.updated} konfigürasyon yüklendi.`,
        });
        loadData();
      } else {
        throw new Error(
          settingsResult.error || promptsResult.message || "Bilinmeyen hata"
        );
      }
    } catch (error) {
      console.error("AI verileri yükleme hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSeedingAll(false);
    }
  };

  /**
   * TÜM AI VERİLERİNİ SIFIRLA
   * - Providers, Models, Configurations sıfırla
   * - Tüm Prompt'ları sıfırla
   */
  const handleResetAll = async () => {
    setResettingAll(true);
    try {
      // 1. Prompt'ları sıfırla
      console.log("🗑️ Prompt'lar sıfırlanıyor...");
      const promptsResult = await resetAllPrompts();

      // 2. Settings sıfırla
      console.log("🗑️ AI Settings sıfırlanıyor...");
      const settingsResult = await resetAiSettings();

      // 3. Konfigürasyonları güncelle
      console.log("🔄 Konfigürasyonlar güncelleniyor...");
      const configResult = await updateConfigurationsWithPrompts();

      if (settingsResult.success && promptsResult.success) {
        toast({
          title: "🔄 Tüm AI Verileri Sıfırlandı!",
          description: `${promptsResult.deleted} eski prompt silindi, ${promptsResult.added} yeni prompt + ${settingsResult.results.added.providers} provider + ${settingsResult.results.added.models} model yüklendi.`,
        });
        loadData();
      } else {
        throw new Error(
          settingsResult.error || promptsResult.message || "Bilinmeyen hata"
        );
      }
    } catch (error) {
      console.error("AI verileri sıfırlama hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResettingAll(false);
    }
  };

  // Legacy handlers - Bu fonksiyonlar artık kullanılmıyor ama eski kod uyumluluğu için tutuldu
  // NOT: seeding, seedingPrompts, resettingPrompts, resettingSettings yukarıda tanımlı

  // Seed initial data (models, providers, configurations) - DEPRECATED
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedAiSettings();
      if (result.success) {
        toast({
          title: "Başarılı",
          description: `AI ayarları başlatıldı. ${result.results.models.success} model eklendi.`,
        });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  // Seed all prompts from hardcoded data to Firestore - DEPRECATED
  const handleSeedPrompts = async () => {
    setSeedingPrompts(true);
    try {
      // İstatistikleri göster
      const stats = getPromptStatistics();
      console.log("📊 Prompt İstatistikleri:", stats);

      // Tüm prompt'ları yükle
      const result = await seedAllPrompts();

      if (result.success) {
        // Konfigürasyonları güncelle
        const configResult = await updateConfigurationsWithPrompts();

        toast({
          title: "🎉 Başarılı!",
          description: `${result.added} prompt Firestore'a yüklendi. ${configResult.updated} konfigürasyon güncellendi.`,
        });

        // Verileri yeniden yükle
        loadData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Prompt seed hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSeedingPrompts(false);
    }
  };

  // Reset all prompts - Delete existing and seed fresh - DEPRECATED
  const handleResetPrompts = async () => {
    setResettingPrompts(true);
    try {
      // Tüm prompt'ları sıfırla (sil + yeniden ekle)
      const result = await resetAllPrompts();

      if (result.success) {
        // Konfigürasyonları güncelle
        const configResult = await updateConfigurationsWithPrompts();

        toast({
          title: "🔄 Prompt'lar Sıfırlandı!",
          description: `${result.deleted} eski prompt silindi, ${result.added} yeni prompt eklendi. ${configResult.updated} konfigürasyon güncellendi.`,
        });

        // Verileri yeniden yükle
        loadData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Prompt sıfırlama hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResettingPrompts(false);
    }
  };

  // Reset all AI settings - Delete existing and seed fresh
  const handleResetSettings = async () => {
    setResettingSettings(true);
    try {
      const result = await resetAiSettings();

      if (result.success) {
        toast({
          title: "🔄 AI Ayarları Sıfırlandı!",
          description: result.message,
        });

        // Verileri yeniden yükle
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("AI ayarları sıfırlama hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResettingSettings(false);
    }
  };

  // Reset configurations to default
  const handleResetConfigurations = async () => {
    setResettingConfigs(true);
    try {
      const result = await resetConfigurations();

      if (result.success) {
        toast({
          title: "🔄 Konfigürasyonlar Sıfırlandı!",
          description: result.message,
        });

        // Verileri yeniden yükle
        loadData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Konfigürasyon sıfırlama hatası:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResettingConfigs(false);
    }
  };

  // Export settings
  const handleExport = async () => {
    try {
      const data = await exportAiSettings();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-settings-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Başarılı", description: "AI ayarları dışa aktarıldı" });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Import settings
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAiSettings(data);
      toast({ title: "Başarılı", description: "AI ayarları içe aktarıldı" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete model
  const handleDeleteModel = async (modelId) => {
    try {
      await deleteAiModel(modelId);
      toast({ title: "Başarılı", description: "Model silindi" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete prompt
  const handleDeletePrompt = async (promptId) => {
    try {
      await deleteAiPrompt(promptId);
      toast({ title: "Başarılı", description: "Prompt silindi" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filter models
  const filteredModels = models.filter((model) => {
    if (providerFilter !== "all" && model.provider !== providerFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        model.name?.toLowerCase().includes(q) ||
        model.displayName?.toLowerCase().includes(q) ||
        model.apiId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt) => {
    if (categoryFilter !== "all" && prompt.category !== categoryFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        prompt.name?.toLowerCase().includes(q) ||
        prompt.key?.toLowerCase().includes(q) ||
        prompt.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <PermissionGuard requiredPermission="ai_settings.read">
        <div className="flex items-center justify-center min-h-[50vh] bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600 dark:text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Yükleniyor...</p>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="ai_settings.read">
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <main className="flex-1 container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                AI Ayarları
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Model, prompt ve konfigürasyon yönetimi
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* ═══════════════════════════════════════════════════════════════
                  ANA BUTONLAR - Sadeleştirilmiş Yapı
                  ═══════════════════════════════════════════════════════════════ */}

              {/* Tümünü Yükle - Providers, Models, Configs + Prompts */}
              <PermissionGuard requiredPermission="ai_settings.write">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSeedAll}
                        disabled={seedingAll}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                      >
                        {seedingAll ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Tümünü Yükle
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white border-0">
                      <p>
                        Providers, Models, Configurations ve tüm Prompt'ları
                        yükler
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PermissionGuard>

              {/* Tümünü Sıfırla - Her şeyi sil ve yeniden yükle */}
              <PermissionGuard requiredPermission="ai_settings.write">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={resettingAll}
                      className="border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    >
                      {resettingAll ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Tümünü Sıfırla
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-slate-800 dark:text-slate-100">
                        Tüm AI Verilerini Sıfırla
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                        <span className="text-rose-500 font-semibold">
                          ⚠️ DİKKAT:
                        </span>{" "}
                        Mevcut TÜM AI verileri (provider, model, konfigürasyon
                        VE prompt'lar) silinecek ve seed dosyalarından yeniden
                        yüklenecek. Elle eklediğiniz veya düzenlediğiniz tüm
                        veriler kaybolacak. Devam etmek istiyor musunuz?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetAll}
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                      >
                        Tümünü Sıfırla ve Yükle
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PermissionGuard>

              {/* CRM Case Summary Ayarlarını Yükle */}
              <PermissionGuard requiredPermission="ai_settings.write">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSeedCaseSummary}
                        disabled={seedingCaseSummary}
                        variant={caseSummarySeeded ? "outline" : "default"}
                        className={caseSummarySeeded 
                          ? "border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                        }
                      >
                        {seedingCaseSummary ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : caseSummarySeeded ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <MessageSquare className="mr-2 h-4 w-4" />
                        )}
                        {caseSummarySeeded ? "CRM Özet ✓" : "CRM Özet Yükle"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white border-0">
                      <p>
                        CRM Case Summary AI ayarlarını (prompt + konfigürasyon) yükler
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PermissionGuard>

              <Button 
                variant="outline" 
                onClick={loadData}
                className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Yenile
              </Button>

              <Button 
                variant="outline" 
                onClick={handleExport}
                className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Dışa Aktar
              </Button>

              <PermissionGuard requiredPermission="ai_settings.write">
                <label>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <Button 
                    variant="outline" 
                    asChild
                    className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      İçe Aktar
                    </span>
                  </Button>
                </label>
              </PermissionGuard>
            </div>
          </div>

          {/* Not seeded warning */}
          {!isSeeded && (
            <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">AI ayarları henüz başlatılmamış</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Varsayılan model ve prompt verilerini yüklemek için
                    "Başlangıç Verilerini Yükle" butonuna tıklayın.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-sm">
              <TabsTrigger 
                value="providers" 
                className="gap-2 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-100"
              >
                <Bot className="h-4 w-4" />
                Providers ({providers.length})
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                className="gap-2 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-100"
              >
                <Brain className="h-4 w-4" />
                Modeller ({models.length})
              </TabsTrigger>
              <TabsTrigger 
                value="prompts" 
                className="gap-2 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-100"
              >
                <FileText className="h-4 w-4" />
                Promptlar ({prompts.length})
              </TabsTrigger>
              <TabsTrigger 
                value="configurations" 
                className="gap-2 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-100"
              >
                <Sliders className="h-4 w-4" />
                Konfigürasyonlar ({configurations.length})
              </TabsTrigger>
              <TabsTrigger 
                value="seed-operations" 
                className="gap-2 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-100"
              >
                <Database className="h-4 w-4" />
                Seed İşlemleri
              </TabsTrigger>
            </TabsList>

            {/* Providers Tab */}
            <TabsContent value="providers">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onUpdate={loadData}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models">
              <div className="space-y-4">
                {/* Filters & Actions */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Select
                      value={providerFilter}
                      onValueChange={setProviderFilter}
                    >
                      <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Providerlar</SelectItem>
                        {/* Firestore'dan gelen providers kullan */}
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.icon} {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Model ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[250px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <PermissionGuard requiredPermission="ai_settings.write">
                    <Button
                      onClick={() => {
                        setEditingModel(null);
                        setModelDialogOpen(true);
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Model
                    </Button>
                  </PermissionGuard>
                </div>

                {/* Models Table */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700">
                        <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Model</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Provider</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300 font-medium">API ID</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Kategori</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Durum</TableHead>
                        <TableHead className="text-right text-slate-600 dark:text-slate-300 font-medium">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModels.map((model) => (
                        <TableRow key={model.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <span className="text-lg">{model.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-100">
                                  {model.displayName || model.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {model.description?.slice(0, 50)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                              {getProviderInfo(model.provider).icon}{" "}
                              {model.provider}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">
                              {model.apiId}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{model.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={model.isActive}
                              onCheckedChange={(checked) =>
                                toggleModelStatus(model.id, checked).then(
                                  loadData
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <PermissionGuard requiredPermission="ai_settings.write">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => {
                                    setEditingModel(model);
                                    setModelDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard requiredPermission="ai_settings.delete">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-slate-800 dark:text-slate-100">
                                        Model Sil
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                        "{model.displayName || model.name}"
                                        modelini silmek istediğinize emin
                                        misiniz?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
                                        İptal
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteModel(model.id)
                                        }
                                        className="bg-rose-500 hover:bg-rose-600 text-white"
                                      >
                                        Sil
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>

            {/* Prompts Tab - Modern Minimalist Design */}
            <TabsContent value="prompts">
              <div className="space-y-6">
                {/* Header & Stats */}
                <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                      <Brain className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Promptları</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Toplam {prompts.length} prompt •{" "}
                        {prompts.filter((p) => p.isActive).length} aktif
                      </p>
                    </div>
                  </div>
                  <PermissionGuard requiredPermission="ai_settings.write">
                    <Button
                      onClick={() => {
                        setEditingPrompt(null);
                        setPromptDialogOpen(true);
                      }}
                      className="gap-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                    >
                      <Plus className="h-4 w-4" />
                      Yeni Prompt
                    </Button>
                  </PermissionGuard>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">📂 Tüm Kategoriler</SelectItem>
                      {Object.entries(PROMPT_CATEGORIES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Prompt ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Prompts Grid */}
                <div className="grid gap-4">
                  {filteredPrompts.map((prompt) => (
                    <Card
                      key={prompt.id}
                      className="group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Prompt Header */}
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={`p-2.5 rounded-xl shrink-0 ${
                                prompt.isActive
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                              }`}
                            >
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium truncate text-slate-800 dark:text-slate-100">
                                  {prompt.name}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={prompt.isActive 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-xs" 
                                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-xs"
                                  }
                                >
                                  {prompt.isActive ? "Aktif" : "Pasif"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-300">
                                  {prompt.key}
                                </code>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  v{prompt.version || "1.0"}
                                </span>
                                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                                  {prompt.category}
                                </Badge>
                                {prompt.context && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    🎯 {prompt.context}
                                  </span>
                                )}
                              </div>
                              {prompt.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                  {prompt.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <PermissionGuard requiredPermission="ai_settings.write">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => {
                                  setEditingPrompt(prompt);
                                  setPromptDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard requiredPermission="ai_settings.delete">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-slate-800 dark:text-slate-100">
                                      Prompt Sil
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                      "{prompt.name}" promptunu silmek
                                      istediğinize emin misiniz?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-slate-200 dark:border-slate-700">İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeletePrompt(prompt.id)
                                      }
                                      className="bg-rose-500 hover:bg-rose-600 text-white"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </PermissionGuard>
                          </div>
                        </div>

                        {/* Meta Info Badges */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {prompt.variables?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400">
                                Değişkenler:
                              </span>
                              {prompt.variables.slice(0, 4).map((v, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs font-mono px-1.5 py-0 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                  {typeof v === "object" ? v.name : v}
                                </Badge>
                              ))}
                              {prompt.variables.length > 4 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                >
                                  +{prompt.variables.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}
                          {prompt.tags?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400">
                                Etiketler:
                              </span>
                              {prompt.tags.slice(0, 3).map((t, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                  #{t}
                                </Badge>
                              ))}
                              {prompt.tags.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0 bg-slate-100 dark:bg-slate-800"
                                >
                                  +{prompt.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          {prompt.defaultSettings && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              <span>
                                🌡️ {prompt.defaultSettings.temperature || 0.7}
                              </span>
                              <span>
                                📏 {prompt.defaultSettings.maxTokens || 2048}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Prompt Content */}
                      <Accordion
                        type="single"
                        collapsible
                        className="border-none"
                      >
                        <AccordionItem value="content" className="border-none">
                          <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              <span>Prompt İçeriğini Görüntüle</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {(
                                  (prompt.systemPrompt || prompt.content || "")
                                    .length / 1000
                                ).toFixed(1)}
                                k karakter
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              {/* System Prompt */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-primary" />
                                  <Label className="text-sm font-medium">
                                    System Prompt
                                  </Label>
                                </div>
                                <div className="relative">
                                  <pre className="text-xs bg-muted/70 p-4 rounded-lg overflow-auto max-h-[250px] whitespace-pre-wrap font-mono border">
                                    {prompt.systemPrompt ||
                                      prompt.content ||
                                      "Sistem prompt'u tanımlanmamış"}
                                  </pre>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-7 text-xs gap-1"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        prompt.systemPrompt ||
                                          prompt.content ||
                                          ""
                                      );
                                      toast({
                                        title: "Kopyalandı",
                                        description:
                                          "System prompt panoya kopyalandı",
                                      });
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                    Kopyala
                                  </Button>
                                </div>
                              </div>

                              {/* User Prompt Template (if exists) */}
                              {prompt.userPromptTemplate && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-sky-500" />
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                      User Prompt Template
                                    </Label>
                                  </div>
                                  <div className="relative">
                                    <pre className="text-xs bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl overflow-auto max-h-[200px] whitespace-pre-wrap font-mono border border-sky-200 dark:border-sky-800 text-slate-600 dark:text-slate-300">
                                      {prompt.userPromptTemplate}
                                    </pre>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-2 right-2 h-7 text-xs gap-1 text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-700"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          prompt.userPromptTemplate
                                        );
                                        toast({
                                          title: "Kopyalandı",
                                          description:
                                            "User prompt template panoya kopyalandı",
                                        });
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                      Kopyala
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Source File Reference */}
                              {prompt.sourceFile && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <Info className="h-3 w-3" />
                                  Kaynak:{" "}
                                  <code className="font-mono text-slate-600 dark:text-slate-300">
                                    {prompt.sourceFile}
                                  </code>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </Card>
                  ))}

                  {/* Empty State */}
                  {filteredPrompts.length === 0 && (
                    <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto mb-4">
                        <Brain className="h-10 w-10 text-slate-400" />
                      </div>
                      <h4 className="font-medium mb-2 text-slate-800 dark:text-slate-100">Prompt Bulunamadı</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {searchQuery || categoryFilter !== "all"
                          ? "Arama kriterlerine uygun prompt bulunamadı."
                          : "Henüz prompt eklenmemiş. Başlangıç verilerini yükleyebilirsiniz."}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Configurations Tab */}
            <TabsContent value="configurations">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {configurations.map((config) => (
                  <ConfigurationCard
                    key={config.id}
                    config={config}
                    models={models}
                    prompts={prompts}
                    providers={providers}
                    onUpdate={loadData}
                  />
                ))}
              </div>

              {configurations.length === 0 && (
                <Card className="p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto mb-4">
                    <Sliders className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Henüz konfigürasyon yok. Başlangıç verilerini yükleyin.
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Seed İşlemleri Tab */}
            <TabsContent value="seed-operations">
              <div className="space-y-6">
                {/* Info Card */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl shrink-0">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Seed İşlemleri Hakkında</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Bu bölümde özel prompt ve konfigürasyon paketlerini veritabanına yükleyebilirsiniz. 
                        Her paket bağımsız çalışır ve mevcut verileri bozmadan güncelleme yapar.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Seed Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Formula v4.0 Prompts */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
                            <FlaskConical className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                              Formül v4.0 Prompt'ları
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                              Kategori bazlı profesyonel formül prompt'ları
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={formulaV4Seeded.allSeeded 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" 
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                          }
                        >
                          {formulaV4Seeded.seeded}/{formulaV4Seeded.total}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">İçerik:</p>
                        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                          <li className="flex items-center gap-2">
                            {formulaV4Seeded.details?.find(d => d.key === "formula_cosmetic_pro")?.exists 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            Kozmetik Formül Üretimi
                          </li>
                          <li className="flex items-center gap-2">
                            {formulaV4Seeded.details?.find(d => d.key === "formula_dermocosmetic_pro")?.exists 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            Dermokozmetik Formül Üretimi
                          </li>
                          <li className="flex items-center gap-2">
                            {formulaV4Seeded.details?.find(d => d.key === "formula_cleaning_pro")?.exists 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            Temizlik Ürünleri Formül Üretimi
                          </li>
                          <li className="flex items-center gap-2">
                            {formulaV4Seeded.details?.find(d => d.key === "formula_supplement_pro")?.exists 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            Gıda Takviyesi Formül Üretimi
                          </li>
                        </ul>
                      </div>
                      <Button
                        onClick={handleSeedFormulaV4}
                        disabled={seedingFormulaV4}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {seedingFormulaV4 ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {formulaV4Seeded.allSeeded ? "Güncelle" : "Yükle"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* CRM Case Summary */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                              CRM Talep Özeti
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                              Konuşma özeti AI konfigürasyonu
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={caseSummarySeeded?.isSeeded 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" 
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                          }
                        >
                          {caseSummarySeeded?.isSeeded ? "Yüklendi" : "Yüklenmedi"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">İçerik:</p>
                        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                          <li className="flex items-center gap-2">
                            {caseSummarySeeded?.hasConfiguration 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            AI Konfigürasyonu
                          </li>
                          <li className="flex items-center gap-2">
                            {caseSummarySeeded?.hasDetailedPrompt 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            Detaylı Özet Prompt'u
                          </li>
                          <li className="flex items-center gap-2">
                            {caseSummarySeeded?.hasQuickPrompt 
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            Hızlı Özet Prompt'u
                          </li>
                        </ul>
                      </div>
                      <Button
                        onClick={handleSeedCaseSummary}
                        disabled={seedingCaseSummary}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {seedingCaseSummary ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {caseSummarySeeded?.isSeeded ? "Güncelle" : "Yükle"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Model Editor Dialog */}
        <ModelEditorDialog
          model={editingModel}
          providers={providers}
          open={modelDialogOpen}
          onOpenChange={setModelDialogOpen}
          onSave={loadData}
        />

        {/* Prompt Editor Dialog */}
        <PromptEditorDialog
          prompt={editingPrompt}
          open={promptDialogOpen}
          onOpenChange={setPromptDialogOpen}
          onSave={loadData}
        />
      </div>
    </PermissionGuard>
  );
}
