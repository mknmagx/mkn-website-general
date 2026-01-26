"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Sliders,
  Eye,
  Sparkles,
  Brain,
  Zap,
  Loader2,
  Check,
  Copy,
  FileText,
  Info,
  MessageSquare,
  MessageSquarePlus,
} from "lucide-react";

// Provider bilgileri
const PROVIDER_INFO = {
  openai: {
    name: "OpenAI",
    icon: "🧠",
    gradient: "from-emerald-400 to-emerald-600",
  },
  anthropic: {
    name: "Anthropic",
    icon: "🔮",
    gradient: "from-amber-400 to-amber-600",
  },
  google: {
    name: "Google AI",
    icon: "✨",
    gradient: "from-blue-400 to-blue-600",
  },
  gemini: {
    name: "Gemini",
    icon: "💫",
    gradient: "from-indigo-400 to-indigo-600",
  },
  cohere: {
    name: "Cohere",
    icon: "🌀",
    gradient: "from-purple-400 to-purple-600",
  },
};

// Helper: Prompt değişkenlerini replace et
const replacePromptVariables = (template, variables) => {
  if (!template || !variables) return template;
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value || `{{${key}}}`);
  });
  return result;
};

/**
 * AI Settings Modal - Reusable Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal açık mı
 * @param {function} props.onOpenChange - Modal durumu değişince çağrılır
 * @param {string} props.title - Modal başlığı
 * @param {string} props.description - Modal açıklaması
 * @param {string} props.contextKey - AI context key (örn: "crm_email_reply")
 * @param {Array} props.availableModels - Mevcut modeller
 * @param {Object} props.currentModel - Seçili model
 * @param {Object} props.currentProvider - Seçili provider
 * @param {function} props.selectModel - Model seçimi fonksiyonu
 * @param {Object} props.prompt - Firestore'dan gelen prompt
 * @param {Object} props.config - Firestore'dan gelen config
 * @param {Object} props.promptVariables - Prompt değişkenleri
 * @param {boolean} props.loading - Yükleniyor mu
 * @param {function} props.onRefresh - Yenile butonu için
 * @param {Object} props.modelSettings - Model ayarları state
 * @param {function} props.setModelSettings - Model ayarları setter
 * @param {string} props.selectedTone - Seçili ton
 * @param {function} props.setSelectedTone - Ton seçimi fonksiyonu
 * @param {Object} props.hybridPromptInfo - Hibrit prompt bilgisi (opsiyonel)
 */
export default function AISettingsModal({
  open,
  onOpenChange,
  title = "AI Ayarları",
  description = "Model, prompt ve token ayarları",
  contextKey,
  availableModels = [],
  currentModel,
  currentProvider,
  selectModel,
  prompt,
  config,
  promptVariables = {},
  loading = false,
  onRefresh,
  modelSettings = { autoMaxTokens: true, maxTokens: 2048, temperature: 0.7 },
  setModelSettings,
  selectedTone,
  setSelectedTone,
  hybridPromptInfo,
}) {
  const [activeTab, setActiveTab] = useState("config");
  const [showVariablesPanel, setShowVariablesPanel] = useState(true);
  const [showFilledPrompt, setShowFilledPrompt] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Prompt kopyala
  const handleCopyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-slate-900 text-lg font-bold">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 py-3 bg-slate-50/50">
            <TabsList className="w-full grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg h-10">
              <TabsTrigger
                value="config"
                className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              >
                <Sliders className="h-4 w-4 mr-2" />
                Ayarlar
              </TabsTrigger>
              <TabsTrigger
                value="prompt"
                className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Prompt
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Config Tab */}
          <TabsContent value="config" className="mt-0 focus:outline-none">
            <ScrollArea className="h-[400px]">
              <div className="p-6 space-y-5">
                {/* Hibrit Prompt Modu Bilgisi (opsiyonel) */}
                {hybridPromptInfo && (
                  <div
                    className={`rounded-xl border overflow-hidden ${
                      hybridPromptInfo.isFirst
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-blue-200 bg-blue-50/50"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 border-b ${
                        hybridPromptInfo.isFirst
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-blue-100 bg-blue-50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Sparkles
                          className={`h-3.5 w-3.5 ${
                            hybridPromptInfo.isFirst
                              ? "text-emerald-500"
                              : "text-blue-500"
                          }`}
                        />
                        Hibrit Prompt Modu
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
                            hybridPromptInfo.isFirst
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                              : "bg-gradient-to-br from-blue-400 to-blue-600"
                          }`}
                        >
                          {hybridPromptInfo.isFirst ? (
                            <MessageSquarePlus className="h-5 w-5 text-white" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900">
                            {hybridPromptInfo.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {hybridPromptInfo.description}
                          </p>
                        </div>
                        {hybridPromptInfo.badge && (
                          <Badge
                            className={`border-0 text-xs ${
                              hybridPromptInfo.isFirst
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {hybridPromptInfo.badge}
                          </Badge>
                        )}
                      </div>
                      {hybridPromptInfo.code && (
                        <div
                          className={`mt-3 pt-3 border-t text-xs ${
                            hybridPromptInfo.isFirst
                              ? "border-emerald-100 text-emerald-700"
                              : "border-blue-100 text-blue-700"
                          }`}
                        >
                          <code className="font-mono bg-white/50 px-2 py-1 rounded">
                            {hybridPromptInfo.code}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Model Card */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Aktif Model
                    </p>
                  </div>
                  <div className="p-4">
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-11 h-11 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                              PROVIDER_INFO[currentProvider?.id]?.gradient ||
                              "from-slate-400 to-slate-500"
                            } flex items-center justify-center shadow-md`}
                          >
                            <span className="text-xl">
                              {PROVIDER_INFO[currentProvider?.id]?.icon || "🤖"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {currentModel?.displayName ||
                                currentModel?.name ||
                                "Model seçilmedi"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {PROVIDER_INFO[currentProvider?.id]?.name ||
                                currentProvider?.id ||
                                "Provider"}
                            </p>
                          </div>
                          {currentModel?.isDefault && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                              Varsayılan
                            </Badge>
                          )}
                        </div>

                        {/* Model Selection */}
                        {availableModels?.length > 1 && selectModel && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <Label className="text-xs text-slate-500 mb-2 block">
                              Model Seç
                            </Label>
                            <Select
                              value={currentModel?.modelId || currentModel?.id}
                              onValueChange={(val) => selectModel(val)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Model seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableModels.map((model) => (
                                  <SelectItem
                                    key={model.modelId || model.id}
                                    value={model.modelId || model.id}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {PROVIDER_INFO[model.provider]?.icon ||
                                          "🤖"}
                                      </span>
                                      <span>
                                        {model.displayName || model.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Model Stats */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            <span>{currentModel?.speed || "Normal"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Brain className="h-3.5 w-3.5 text-purple-500" />
                            <span>{availableModels?.length || 0} model</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Token Settings */}
                {setModelSettings && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Token Limiti
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs ${
                            modelSettings.autoMaxTokens
                              ? "text-purple-600 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          Otomatik
                        </span>
                        <Switch
                          checked={modelSettings.autoMaxTokens}
                          onCheckedChange={(checked) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              autoMaxTokens: checked,
                            }))
                          }
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      {modelSettings.autoMaxTokens ? (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-900">
                              Otomatik ayarlama aktif
                            </p>
                            <p className="text-xs text-purple-600">
                              Firestore config:{" "}
                              {config?.settings?.maxTokens?.toLocaleString() ||
                                2048}{" "}
                              token
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={modelSettings.maxTokens}
                              onChange={(e) =>
                                setModelSettings((prev) => ({
                                  ...prev,
                                  maxTokens: parseInt(e.target.value) || 1000,
                                }))
                              }
                              min={500}
                              max={8000}
                              step={256}
                              className="flex-1 h-10 rounded-lg border-slate-200 text-center font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[1024, 2048, 4096, 8000].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setModelSettings((prev) => ({
                                    ...prev,
                                    maxTokens: val,
                                  }))
                                }
                                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                                  modelSettings.maxTokens === val
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {val >= 1000
                                  ? `${(val / 1000).toFixed(
                                      val % 1000 === 0 ? 0 : 1
                                    )}K`
                                  : val}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Temperature */}
                {setModelSettings && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Yaratıcılık (Temperature)
                      </p>
                      <span className="text-sm font-bold text-purple-600 font-mono">
                        {modelSettings.temperature.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={modelSettings.temperature}
                          onChange={(e) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              temperature: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between mt-3 text-xs">
                        <span className="text-blue-600 font-medium">
                          Tutarlı
                        </span>
                        <span className="text-purple-600 font-medium">
                          Dengeli
                        </span>
                        <span className="text-pink-600 font-medium">
                          Yaratıcı
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tone Options */}
                {config?.toneOptions && setSelectedTone && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Yanıt Tonları (Config)
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(config.toneOptions).map(
                          ([key, value]) => {
                            const label =
                              typeof value === "object" ? value.label : key;
                            const toneDescription =
                              typeof value === "object"
                                ? value.promptSuffix || value.description || ""
                                : value;

                            return (
                              <div
                                key={key}
                                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                  selectedTone === key
                                    ? "border-purple-300 bg-purple-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                                onClick={() => setSelectedTone(key)}
                              >
                                <p className="text-sm font-medium text-slate-800">
                                  {label}
                                </p>
                                {toneDescription && (
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                    {toneDescription}
                                  </p>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Prompt Tab */}
          <TabsContent value="prompt" className="mt-0 focus:outline-none">
            <ScrollArea className="h-[400px]" style={{ width: "100%" }}>
              <div
                className="p-6 space-y-4"
                style={{ maxWidth: "100%", overflow: "hidden" }}
              >
                {/* Hibrit Prompt Seçici (opsiyonel) */}
                {hybridPromptInfo && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* İlk Karşılama Promptu */}
                      <div
                        className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          hybridPromptInfo.isFirst
                            ? "border-emerald-400 bg-emerald-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              hybridPromptInfo.isFirst
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              hybridPromptInfo.isFirst
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }`}
                          >
                            {hybridPromptInfo.firstLabel || "İlk Karşılama"}
                          </span>
                          {hybridPromptInfo.isFirst && (
                            <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                              AKTİF
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-[10px] ${
                            hybridPromptInfo.isFirst
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {hybridPromptInfo.firstDesc ||
                            "Sıcak karşılama • Max 100 kelime"}
                        </p>
                      </div>

                      {/* Devam Yanıtı Promptu */}
                      <div
                        className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          !hybridPromptInfo.isFirst
                            ? "border-blue-400 bg-blue-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              !hybridPromptInfo.isFirst
                                ? "bg-blue-500"
                                : "bg-slate-300"
                            }`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              !hybridPromptInfo.isFirst
                                ? "text-blue-700"
                                : "text-slate-500"
                            }`}
                          >
                            {hybridPromptInfo.continueLabel || "Devam Yanıtı"}
                          </span>
                          {!hybridPromptInfo.isFirst && (
                            <Badge className="bg-blue-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                              AKTİF
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-[10px] ${
                            !hybridPromptInfo.isFirst
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        >
                          {hybridPromptInfo.continueDesc ||
                            "Akıllı bağlam • 80-120 kelime"}
                        </p>
                      </div>
                    </div>

                    {/* Mesaj Sayısı Bilgisi */}
                    <div
                      className={`text-center py-2 px-3 rounded-lg text-xs ${
                        hybridPromptInfo.isFirst
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {hybridPromptInfo.statusText || (
                        <>
                          Bu konuşmada <strong>{hybridPromptInfo.count}</strong>{" "}
                          mesaj var →
                          <code className="ml-1 bg-white/50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {hybridPromptInfo.code}
                          </code>{" "}
                          kullanılacak
                        </>
                      )}
                    </div>
                  </>
                )}

                {prompt ? (
                  <>
                    {/* Prompt Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {prompt.name && (
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs font-medium">
                            {prompt.name}
                          </Badge>
                        )}
                        {prompt.version && (
                          <Badge variant="outline" className="text-xs font-mono">
                            v{prompt.version}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyPrompt(
                            prompt?.systemPrompt || prompt?.content || ""
                          )
                        }
                        className="h-8 px-3 text-xs rounded-lg hover:bg-slate-100 flex-shrink-0"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />{" "}
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1.5" /> Kopyala
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Aktif Değişkenler Paneli */}
                    {Object.keys(promptVariables).length > 0 && (
                      <div 
                        className="rounded-xl border border-emerald-200 overflow-hidden bg-emerald-50/50"
                        style={{ maxWidth: "100%", width: "100%", boxSizing: "border-box" }}
                      >
                        <div
                          className="px-3 py-2 bg-emerald-100 border-b border-emerald-200 flex items-center justify-between cursor-pointer"
                          onClick={() => setShowVariablesPanel((prev) => !prev)}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Aktif Değişkenler
                            </span>
                            <Badge className="bg-emerald-200 text-emerald-800 text-[9px] px-1.5 py-0 h-4">
                              {Object.keys(promptVariables).length} adet
                            </Badge>
                          </div>
                          <span className="text-emerald-600 text-xs">
                            {showVariablesPanel ? "▲" : "▼"}
                          </span>
                        </div>
                        {showVariablesPanel && (
                          <div 
                            className="p-3 space-y-2 overflow-hidden"
                            style={{ maxWidth: "100%", maxHeight: "192px", overflowY: "auto", overflowX: "hidden" }}
                          >
                            {Object.entries(promptVariables).map(
                              ([key, value]) => {
                                // Değeri güvenli şekilde string'e çevir ve kısalt
                                const strValue = value != null ? String(value) : "";
                                const displayValue = strValue 
                                  ? (strValue.length > 50 ? strValue.substring(0, 50).replace(/</g, '&lt;') + "..." : strValue.replace(/</g, '&lt;'))
                                  : "(boş)";
                                
                                return (
                                  <div
                                    key={key}
                                    className="grid grid-cols-[auto_1fr] gap-2 text-[11px]"
                                    style={{ maxWidth: "100%", overflow: "hidden" }}
                                  >
                                    <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                                      {`{{${key}}}`}
                                    </code>
                                    <span
                                      className={`${value ? "text-slate-600" : "italic text-slate-400"}`}
                                      style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "block",
                                      }}
                                      title={value || "(boş)"}
                                    >
                                      {displayValue}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* System Prompt */}
                    <div
                      className="rounded-xl border border-slate-700 overflow-hidden"
                      style={{ maxWidth: "100%" }}
                    >
                      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-[11px] text-slate-400 ml-1 font-mono">
                          system_prompt
                        </span>
                      </div>
                      <div
                        className="bg-slate-900 p-4 overflow-auto max-h-64"
                        style={{ maxWidth: "100%" }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            fontSize: "12px",
                            lineHeight: "1.6",
                            color: "#f3f4f6",
                            fontFamily:
                              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                          }}
                        >
                          {prompt.systemPrompt ||
                            prompt.content ||
                            "Prompt bulunamadı"}
                        </pre>
                      </div>
                    </div>

                    {/* User Prompt Template */}
                    {prompt.userPromptTemplate && (
                      <div
                        className="rounded-xl border border-purple-800 overflow-hidden"
                        style={{ maxWidth: "100%" }}
                      >
                        <div className="px-3 py-2 bg-purple-900 border-b border-purple-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-[11px] text-purple-300 ml-1 font-mono">
                              user_prompt{" "}
                              {showFilledPrompt
                                ? "(değişkenler dolu)"
                                : "(template)"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-purple-400">
                              {showFilledPrompt ? "Dolu" : "Template"}
                            </span>
                            <Switch
                              checked={showFilledPrompt}
                              onCheckedChange={setShowFilledPrompt}
                              className="scale-75"
                            />
                          </div>
                        </div>
                        <div
                          className="bg-purple-950 p-4 overflow-auto max-h-64"
                          style={{ maxWidth: "100%" }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              fontSize: "12px",
                              lineHeight: "1.6",
                              color: "#f3e8ff",
                              fontFamily:
                                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                            }}
                          >
                            {showFilledPrompt
                              ? replacePromptVariables(
                                  prompt.userPromptTemplate,
                                  promptVariables
                                )
                              : prompt.userPromptTemplate}
                          </pre>
                        </div>
                        {/* User instruction info */}
                        {showFilledPrompt && promptVariables.user_instruction && (
                          <div className="px-3 py-2 bg-amber-900/50 border-t border-amber-800/50 flex items-center gap-2">
                            <Zap className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] text-amber-300">
                              Operatör Talimatı: "
                              {promptVariables.user_instruction.substring(0, 50)}
                              {promptVariables.user_instruction.length > 50
                                ? "..."
                                : ""}
                              "
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {prompt.description && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 leading-relaxed">
                          {prompt.description}
                        </p>
                      </div>
                    )}
                  </>
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">
                      Prompt yükleniyor...
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Firestore'dan veri alınıyor
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">
                      Prompt bulunamadı
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Bu context için prompt Firestore'da tanımlı değil
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Context:{" "}
            <span className="font-mono text-slate-500">{contextKey}</span>
          </p>
          <div className="flex gap-2">
            {onRefresh && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="rounded-lg hover:bg-slate-200"
              >
                <Loader2
                  className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
                />
                Yenile
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-lg hover:bg-slate-200"
            >
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
