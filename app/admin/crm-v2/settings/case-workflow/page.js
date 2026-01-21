"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  getChecklistSettings,
  updateChecklistForCaseType,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  resetChecklistToDefault,
  getSLASettings,
  updateSLAForStatus,
  resetSLAToDefaults,
  getAutoReminderRules,
  updateAutoReminderRule,
  addAutoReminderRule,
  deleteAutoReminderRule,
} from "../../../../../lib/services/crm-v2";
import {
  CASE_TYPE,
  CASE_STATUS,
  getCaseTypeLabel,
  getCaseStatusLabel,
  DEFAULT_CHECKLISTS,
  DEFAULT_SLA_SETTINGS,
} from "../../../../../lib/services/crm-v2/schema";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Switch } from "../../../../../components/ui/switch";
import { Checkbox } from "../../../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Separator } from "../../../../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../../components/ui/accordion";

// Icons
import {
  ArrowLeft,
  Settings,
  CheckSquare,
  Clock,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2,
  RotateCcw,
  GripVertical,
  AlertTriangle,
  Timer,
  ListChecks,
} from "lucide-react";

// Aşama seçenekleri
const PHASE_OPTIONS = [
  { value: "qualifying", label: "Değerlendirme" },
  { value: "quote_sent", label: "Teklif Aşaması" },
  { value: "negotiating", label: "Pazarlık" },
  { value: "won", label: "Kazanıldı" },
];

export default function CaseWorkflowSettingsPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [checklists, setChecklists] = useState({});
  const [slaSettings, setSlaSettings] = useState({});
  const [autoReminderRules, setAutoReminderRules] = useState({ enabled: true, rules: [] });

  // UI states
  const [selectedCaseType, setSelectedCaseType] = useState(CASE_TYPE.COSMETIC_MANUFACTURING);
  const [activeTab, setActiveTab] = useState("checklist");

  // Dialog states
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [checklistForm, setChecklistForm] = useState({
    label: "",
    required: false,
    phase: "qualifying",
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [checklistData, slaData, reminderData] = await Promise.all([
        getChecklistSettings(),
        getSLASettings(),
        getAutoReminderRules(),
      ]);
      
      setChecklists(checklistData || DEFAULT_CHECKLISTS);
      setSlaSettings(slaData || DEFAULT_SLA_SETTINGS);
      setAutoReminderRules(reminderData || { enabled: true, rules: [] });
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Checklist handlers
  const handleAddChecklistItem = () => {
    setEditingItem(null);
    setChecklistForm({ label: "", required: false, phase: "qualifying" });
    setShowChecklistDialog(true);
  };

  const handleEditChecklistItem = (item) => {
    setEditingItem(item);
    setChecklistForm({
      label: item.label,
      required: item.required,
      phase: item.phase,
    });
    setShowChecklistDialog(true);
  };

  const handleSaveChecklistItem = async () => {
    if (!checklistForm.label.trim()) {
      toast({
        title: "Hata",
        description: "Görev açıklaması zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateChecklistItem(selectedCaseType, editingItem.id, checklistForm, user?.uid);
        toast({ title: "✅ Güncellendi" });
      } else {
        await addChecklistItem(selectedCaseType, checklistForm, user?.uid);
        toast({ title: "✅ Eklendi" });
      }
      setShowChecklistDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving checklist item:", error);
      toast({
        title: "Hata",
        description: "Kaydetme başarısız.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    if (!window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteChecklistItem(selectedCaseType, itemId, user?.uid);
      toast({ title: "✅ Silindi" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silme başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleResetChecklist = async () => {
    if (!window.confirm(`"${getCaseTypeLabel(selectedCaseType)}" için checklist varsayılanlara sıfırlansın mı?`)) return;

    try {
      await resetChecklistToDefault(selectedCaseType, user?.uid);
      toast({ title: "✅ Sıfırlandı" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sıfırlama başarısız.",
        variant: "destructive",
      });
    }
  };

  // SLA handlers
  const handleSaveSLASetting = async (status, settings) => {
    setSaving(true);
    try {
      await updateSLAForStatus(status, settings, user?.uid);
      toast({ title: "✅ Kaydedildi" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kaydetme başarısız.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSLA = async () => {
    if (!window.confirm("Tüm SLA ayarları varsayılanlara sıfırlansın mı?")) return;

    try {
      await resetSLAToDefaults(user?.uid);
      toast({ title: "✅ Sıfırlandı" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sıfırlama başarısız.",
        variant: "destructive",
      });
    }
  };

  // Auto reminder handlers
  const handleToggleRule = async (ruleId, enabled) => {
    try {
      await updateAutoReminderRule(ruleId, { enabled }, user?.uid);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Bu kuralı silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteAutoReminderRule(ruleId, user?.uid);
      toast({ title: "✅ Silindi" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silme başarısız.",
        variant: "destructive",
      });
    }
  };

  // Mevcut case türü için checklist
  const currentChecklist = checklists[selectedCaseType] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/crm-v2/settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ayarlar
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              Case İş Akışı Ayarları
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Checklist, SLA ve otomatik hatırlatma kuralları
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-slate-200">
            <TabsTrigger value="checklist" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="sla" className="gap-2">
              <Timer className="h-4 w-4" />
              SLA Ayarları
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Bell className="h-4 w-4" />
              Otomatik Hatırlatmalar
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle>Case Türüne Göre Checklist</CardTitle>
                      <CardDescription>
                        Her case türü için yapılması gereken görevleri tanımlayın
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetChecklist}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Varsayılana Dön
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Case Type Selector */}
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium whitespace-nowrap">Case Türü:</Label>
                  <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CASE_TYPE).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getCaseTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddChecklistItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Görev Ekle
                  </Button>
                </div>

                <Separator />

                {/* Checklist Items */}
                <div className="space-y-2">
                  {currentChecklist.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Bu case türü için henüz checklist tanımlanmamış.</p>
                      <Button size="sm" className="mt-4" onClick={handleAddChecklistItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        İlk Görevi Ekle
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible defaultValue="qualifying" className="space-y-2">
                      {PHASE_OPTIONS.map((phase) => {
                        const phaseItems = currentChecklist.filter((item) => item.phase === phase.value);
                        if (phaseItems.length === 0) return null;

                        return (
                          <AccordionItem
                            key={phase.value}
                            value={phase.value}
                            className="border border-slate-200 rounded-lg bg-slate-50/50"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-white">
                                  {phase.label}
                                </Badge>
                                <span className="text-sm text-slate-500">
                                  {phaseItems.length} görev
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-2">
                                {phaseItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                                      <span className="text-sm">{item.label}</span>
                                      {item.required && (
                                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                          Zorunlu
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEditChecklistItem(item)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteChecklistItem(item.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA Tab */}
          <TabsContent value="sla" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Timer className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>SLA (Servis Seviyesi) Ayarları</CardTitle>
                      <CardDescription>
                        Her aşama için maksimum süre ve uyarı eşikleri
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetSLA}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Varsayılana Dön
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(slaSettings).map(([status, settings]) => (
                    <div
                      key={status}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-200 text-slate-700">
                            {getCaseStatusLabel(status)}
                          </Badge>
                          <span className="text-sm text-slate-500">{settings.label}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Maksimum Süre (saat)</Label>
                          <Input
                            type="number"
                            value={settings.maxDuration}
                            onChange={(e) => {
                              const newSettings = { ...slaSettings };
                              newSettings[status].maxDuration = parseInt(e.target.value) || 0;
                              setSlaSettings(newSettings);
                            }}
                            onBlur={() => handleSaveSLASetting(status, { maxDuration: settings.maxDuration })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Uyarı Eşiği (saat)</Label>
                          <Input
                            type="number"
                            value={settings.warningThreshold}
                            onChange={(e) => {
                              const newSettings = { ...slaSettings };
                              newSettings[status].warningThreshold = parseInt(e.target.value) || 0;
                              setSlaSettings(newSettings);
                            }}
                            onBlur={() => handleSaveSLASetting(status, { warningThreshold: settings.warningThreshold })}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-white rounded border border-slate-100 text-xs text-slate-500">
                        {settings.maxDuration >= 24
                          ? `${Math.round(settings.maxDuration / 24)} gün içinde işlem yapılmalı`
                          : `${settings.maxDuration} saat içinde işlem yapılmalı`}
                        {" • "}
                        {settings.warningThreshold >= 24
                          ? `${Math.round(settings.warningThreshold / 24)} gün sonra uyarı`
                          : `${settings.warningThreshold} saat sonra uyarı`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Otomatik Hatırlatma Kuralları</CardTitle>
                    <CardDescription>
                      Belirli koşullar sağlandığında otomatik hatırlatma oluşturulur
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {autoReminderRules.rules?.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-lg border ${
                        rule.enabled
                          ? "bg-white border-slate-200"
                          : "bg-slate-50 border-slate-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(v) => handleToggleRule(rule.id, v)}
                          />
                          <div>
                            <p className="font-medium text-sm">{rule.name}</p>
                            <p className="text-xs text-slate-500">
                              {rule.triggerDays} gün sonra tetiklenir
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!autoReminderRules.rules || autoReminderRules.rules.length === 0) && (
                    <div className="text-center py-8 text-slate-400">
                      <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Henüz otomatik hatırlatma kuralı yok</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Checklist Item Dialog */}
      <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Görevi Düzenle" : "Yeni Görev Ekle"}
            </DialogTitle>
            <DialogDescription>
              {getCaseTypeLabel(selectedCaseType)} için checklist görevi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Görev Açıklaması</Label>
              <Input
                id="label"
                value={checklistForm.label}
                onChange={(e) => setChecklistForm({ ...checklistForm, label: e.target.value })}
                placeholder="Örn: Müşteri bilgileri doğrulandı"
              />
            </div>
            <div className="space-y-2">
              <Label>Aşama</Label>
              <Select
                value={checklistForm.phase}
                onValueChange={(v) => setChecklistForm({ ...checklistForm, phase: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_OPTIONS.map((phase) => (
                    <SelectItem key={phase.value} value={phase.value}>
                      {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Checkbox
                id="required"
                checked={checklistForm.required}
                onCheckedChange={(v) => setChecklistForm({ ...checklistForm, required: v })}
              />
              <div>
                <Label htmlFor="required" className="text-sm font-medium cursor-pointer">
                  Zorunlu Görev
                </Label>
                <p className="text-xs text-slate-500">
                  Bu görev tamamlanmadan bir sonraki aşamaya geçilemez
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChecklistDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveChecklistItem} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
