"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { uploadFile } from "../../../lib/storage";
import {
  PRODUCTION_STAGE,
  PRODUCTION_STAGE_GROUPS,
  getProductionStageLabel,
  getProductionStageOrder,
  PACKAGING_TYPES,
  PACKAGING_MATERIALS,
  PACKAGING_CAPACITIES,
} from "../../../lib/services/crm-v2";

// UI Components
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Checkbox } from "../../ui/checkbox";
import { Switch } from "../../ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

// Icons
import {
  Check,
  Circle,
  ChevronRight,
  ClipboardList,
  Palette,
  Truck,
  Factory,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  FlaskConical,
  Upload,
  Image,
  FileText,
  Plus,
  Trash2,
  Edit,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

const STAGE_GROUP_ICONS = {
  ClipboardList,
  Palette,
  Truck,
  Factory,
  Package,
  CheckCircle,
};

/**
 * Üretim Workflow Timeline Component
 * 
 * 16 Aşama, 6 Grup:
 * 1. Hazırlık: Formül Seçimi, Formül Onayı
 * 2. Tasarım: Ambalaj Tasarımı, Etiket Tasarımı, Kutu Tasarımı, Tasarım Onayları
 * 3. Tedarik: Hammadde Tedarik, Ambalaj Tedarik
 * 4. Üretim: Üretim Planlama, Üretim, Dolum, Kalite Kontrol
 * 5. Paketleme: Etiketleme, Kutulama, Son Paketleme
 * 6. Teslim: Teslimata Hazır
 * 
 * NOT: Timeline sadece görsel göstergedir. Stage'ler detay formundaki switch'lerle güncellenir.
 */
export function ProductionWorkflowTimeline({ 
  currentStage, 
  production = {},
  disabled = false,
}) {
  const [expandedGroup, setExpandedGroup] = useState(null);
  const stages = getProductionStageOrder();

  // Check if a stage is completed based on production data
  const isStageCompleted = (stage) => {
    switch (stage) {
      case PRODUCTION_STAGE.FORMULA_SELECTION:
        return !!production?.formulaId;
      case PRODUCTION_STAGE.FORMULA_APPROVAL:
        return !!production?.formulaApproved;
      case PRODUCTION_STAGE.PACKAGING_DESIGN:
        return !!production?.packaging?.approved;
      case PRODUCTION_STAGE.LABEL_DESIGN:
        return !!production?.label?.approved;
      case PRODUCTION_STAGE.BOX_DESIGN:
        return !!production?.box?.approved || !production?.box?.required;
      case PRODUCTION_STAGE.DESIGN_APPROVAL:
        return !!production?.designsApproved;
      case PRODUCTION_STAGE.RAW_MATERIAL:
        return !!production?.supply?.rawMaterialReceived;
      case PRODUCTION_STAGE.PACKAGING_SUPPLY:
        return !!production?.supply?.packagingReceived;
      case PRODUCTION_STAGE.LABEL_SUPPLY:
        return !!production?.supply?.labelReceived;
      case PRODUCTION_STAGE.BOX_SUPPLY:
        return !!production?.supply?.boxReceived || !production?.box?.required;
      case PRODUCTION_STAGE.PRODUCTION_PLANNING:
        return !!production?.productionPlanned;
      case PRODUCTION_STAGE.PRODUCTION:
        return !!production?.productionCompleted;
      case PRODUCTION_STAGE.FILLING:
        return !!production?.fillingCompleted;
      case PRODUCTION_STAGE.QUALITY_CONTROL:
        return !!production?.qcApproved;
      case PRODUCTION_STAGE.LABELING:
        return !!production?.labelingCompleted;
      case PRODUCTION_STAGE.BOXING:
        return !!production?.boxingCompleted;
      case PRODUCTION_STAGE.FINAL_PACKAGING:
        return !!production?.finalPackagingCompleted;
      case PRODUCTION_STAGE.READY_FOR_DELIVERY:
        return !!production?.readyForDelivery;
      default:
        return false;
    }
  };

  // Count completed stages
  const completedCount = stages.filter(s => isStageCompleted(s)).length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  // Calculate current stage as first incomplete stage in sequence
  const calculatedCurrentStage = stages.find(s => !isStageCompleted(s)) || stages[stages.length - 1];

  // Check if stage is the calculated current
  const isStageCurrent = (stage) => stage === calculatedCurrentStage;

  // Hangi grup aktif?
  const findCurrentGroup = () => {
    return PRODUCTION_STAGE_GROUPS.find(g => g.stages.includes(calculatedCurrentStage))?.id || null;
  };

  // İlk yüklemede aktif grubu aç
  useEffect(() => {
    const currentGroupId = findCurrentGroup();
    if (currentGroupId && !expandedGroup) {
      setExpandedGroup(currentGroupId);
    }
  }, [currentStage]);

  const handleGroupClick = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-4">
        <Progress value={progressPercent} className="h-2 flex-1" />
        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
          {completedCount} / {stages.length}
        </span>
      </div>

      {/* Stage Groups - View Only */}
      <div className="space-y-2">
        {PRODUCTION_STAGE_GROUPS.map((group) => {
          const GroupIcon = STAGE_GROUP_ICONS[group.icon] || Circle;
          const groupStages = group.stages;
          const completedInGroup = groupStages.filter(s => isStageCompleted(s)).length;
          const isGroupComplete = groupStages.every(s => isStageCompleted(s));
          const hasAnyCompleted = completedInGroup > 0;
          const isExpanded = expandedGroup === group.id;

          return (
            <div 
              key={group.id}
              className={cn(
                "rounded-lg border transition-all overflow-hidden",
                isGroupComplete && "bg-emerald-50/50 border-emerald-200",
                hasAnyCompleted && !isGroupComplete && "bg-blue-50/50 border-blue-200",
                !hasAnyCompleted && "bg-white border-slate-200"
              )}
            >
              {/* Group Header - Clickable to expand */}
              <button
                onClick={() => handleGroupClick(group.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 text-left transition-colors",
                  isExpanded && "border-b",
                  isExpanded && isGroupComplete && "border-emerald-200",
                  isExpanded && hasAnyCompleted && !isGroupComplete && "border-blue-200",
                  isExpanded && !hasAnyCompleted && "border-slate-200"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center",
                    isGroupComplete && "bg-emerald-500 text-white",
                    hasAnyCompleted && !isGroupComplete && "bg-blue-500 text-white",
                    !hasAnyCompleted && "bg-slate-200 text-slate-400"
                  )}>
                    {isGroupComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <GroupIcon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <span className={cn(
                      "text-sm font-medium",
                      isGroupComplete && "text-emerald-700",
                      hasAnyCompleted && !isGroupComplete && "text-blue-700",
                      !hasAnyCompleted && "text-slate-700"
                    )}>
                      {group.label}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {completedInGroup}/{groupStages.length}
                    </span>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  isExpanded && "rotate-90"
                )} />
              </button>

              {/* Expanded Stages List - View Only */}
              {isExpanded && (
                <div className="p-2 space-y-1">
                  {groupStages.map((stage, idx) => {
                    const stageIndex = stages.indexOf(stage);
                    const isCompleted = isStageCompleted(stage);
                    const isCurrent = isStageCurrent(stage);

                    return (
                      <div
                        key={stage}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md",
                          isCompleted && "bg-emerald-100/70",
                          isCurrent && !isCompleted && "bg-blue-100 ring-1 ring-blue-300",
                          !isCompleted && !isCurrent && "bg-slate-50"
                        )}
                      >
                        {/* Stage Number/Check */}
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                          isCompleted && "bg-emerald-500 text-white",
                          isCurrent && !isCompleted && "bg-blue-500 text-white",
                          !isCompleted && !isCurrent && "bg-slate-200 text-slate-500"
                        )}>
                          {isCompleted ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            stageIndex + 1
                          )}
                        </div>

                        {/* Stage Label */}
                        <span className={cn(
                          "text-sm flex-1",
                          isCompleted && "text-emerald-700",
                          isCurrent && !isCompleted && "text-blue-700 font-medium",
                          !isCompleted && !isCurrent && "text-slate-500"
                        )}>
                          {getProductionStageLabel(stage)}
                        </span>

                        {/* Status indicators */}
                        {isCompleted && (
                          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                            Tamamlandı
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                            Aktif
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Info - Current Stage */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-4">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm text-slate-600">
          Sıradaki Aşama: <span className="font-medium text-slate-900">{getProductionStageLabel(calculatedCurrentStage)}</span>
        </span>
        <span className="text-xs text-slate-400 ml-auto">
          Detaylardan güncelle
        </span>
      </div>
    </div>
  );
}

/**
 * Üretim Detayları Form Component
 * 7 Tab: Formül, Ambalaj, Etiket, Kutu, Tedarik, Üretim, Paketleme
 * Her tab ilgili stage'leri tamamlayan switch'ler içerir
 */
export function ProductionDetailsForm({
  production,
  currentStage,
  onChange,
  onStageChange,
  onFormulaSelect,
  disabled = false,
}) {
  const [activeTab, setActiveTab] = useState("formula");
  
  // Local state for debounced updates
  const [localProduction, setLocalProduction] = useState(production);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef(null);
  
  const stages = getProductionStageOrder();
  const currentStageIndex = stages.indexOf(currentStage);

  // Sync with external production prop when it changes from outside
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalProduction(production);
    }
  }, [production, hasUnsavedChanges]);

  // Debounced save function
  const debouncedSave = useCallback((data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      onChange(data);
      setHasUnsavedChanges(false);
    }, 1500); // 1.5 saniye bekle
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (section, field, value) => {
    let newData;
    if (section) {
      newData = {
        ...localProduction,
        [section]: {
          ...(localProduction?.[section] || {}),
          [field]: value,
        },
      };
    } else {
      newData = {
        ...localProduction,
        [field]: value,
      };
    }
    
    // Update local state immediately
    setLocalProduction(newData);
    setHasUnsavedChanges(true);
    
    // Debounce the save
    debouncedSave(newData);
  };
  
  // Immediate save for switches/checkboxes
  const handleImmediateChange = (section, field, value) => {
    let newData;
    if (section) {
      newData = {
        ...localProduction,
        [section]: {
          ...(localProduction?.[section] || {}),
          [field]: value,
        },
      };
    } else {
      newData = {
        ...localProduction,
        [field]: value,
      };
    }
    
    // Clear any pending debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setLocalProduction(newData);
    onChange(newData);
    setHasUnsavedChanges(false);
  };

  // File upload states
  const [uploadingFile, setUploadingFile] = useState(null); // 'label' | 'box' | null
  const fileInputRef = useRef(null);
  const boxFileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    setUploadingFile(type);
    try {
      const path = `orders/production/${type}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      // Update local state with file URL
      handleImmediateChange(type, 'designFile', url);
      handleImmediateChange(type, 'designFileName', file.name);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(null);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (type) => {
    handleImmediateChange(type, 'designFile', null);
    handleImmediateChange(type, 'designFileName', null);
  };

  // Check if a stage is completed - based on individual boolean values, NOT sequential
  const isStageCompleted = (stage) => {
    switch (stage) {
      case PRODUCTION_STAGE.FORMULA_SELECTION:
        return !!localProduction?.formulaId;
      case PRODUCTION_STAGE.FORMULA_APPROVAL:
        return !!localProduction?.formulaApproved;
      case PRODUCTION_STAGE.PACKAGING_DESIGN:
        return !!localProduction?.packaging?.approved;
      case PRODUCTION_STAGE.LABEL_DESIGN:
        return !!localProduction?.label?.approved;
      case PRODUCTION_STAGE.BOX_DESIGN:
        return !!localProduction?.box?.approved || !localProduction?.box?.required;
      case PRODUCTION_STAGE.DESIGN_APPROVAL:
        return !!localProduction?.designsApproved;
      case PRODUCTION_STAGE.RAW_MATERIAL:
        return !!localProduction?.supply?.rawMaterialReceived;
      case PRODUCTION_STAGE.PACKAGING_SUPPLY:
        return !!localProduction?.supply?.packagingReceived;
      case PRODUCTION_STAGE.LABEL_SUPPLY:
        return !!localProduction?.supply?.labelReceived;
      case PRODUCTION_STAGE.BOX_SUPPLY:
        return !!localProduction?.supply?.boxReceived || !localProduction?.box?.required;
      case PRODUCTION_STAGE.PRODUCTION_PLANNING:
        return !!localProduction?.productionPlanned;
      case PRODUCTION_STAGE.PRODUCTION:
        return !!localProduction?.productionCompleted;
      case PRODUCTION_STAGE.FILLING:
        return !!localProduction?.fillingCompleted;
      case PRODUCTION_STAGE.QUALITY_CONTROL:
        return !!localProduction?.qcApproved;
      case PRODUCTION_STAGE.LABELING:
        return !!localProduction?.labelingCompleted;
      case PRODUCTION_STAGE.BOXING:
        return !!localProduction?.boxingCompleted;
      case PRODUCTION_STAGE.FINAL_PACKAGING:
        return !!localProduction?.finalPackagingCompleted;
      case PRODUCTION_STAGE.READY_FOR_DELIVERY:
        return !!localProduction?.readyForDelivery;
      default:
        return false;
    }
  };

  // Check if a stage is current (for visual highlighting only)
  const isStageCurrent = (stage) => stage === currentStage;

  // Count completed stages for progress
  const completedStagesCount = stages.filter(s => isStageCompleted(s)).length;
  const progressPercent = Math.round((completedStagesCount / stages.length) * 100);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <TabsList className="bg-slate-100/50 p-1 h-auto rounded-lg flex-1 flex-wrap">
          <TabsTrigger value="formula" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <FlaskConical className="h-3.5 w-3.5 mr-1" />
            Formül
          </TabsTrigger>
          <TabsTrigger value="design" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Palette className="h-3.5 w-3.5 mr-1" />
            Tasarım
          </TabsTrigger>
          <TabsTrigger value="supply" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Truck className="h-3.5 w-3.5 mr-1" />
            Tedarik
          </TabsTrigger>
          <TabsTrigger value="production" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Factory className="h-3.5 w-3.5 mr-1" />
            Üretim
          </TabsTrigger>
          <TabsTrigger value="packaging" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Package className="h-3.5 w-3.5 mr-1" />
            Paketleme
          </TabsTrigger>
        </TabsList>
        
        {/* Saving indicator */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
            <span>Kaydediliyor...</span>
          </div>
        )}
      </div>

      {/* Formül Tab - Stages: formula_selection, formula_approval */}
      <TabsContent value="formula" className="mt-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-violet-500" />
            Formül Bilgileri
          </h4>
          
          {/* Formül Seçimi */}
          {localProduction?.formulaId ? (
            <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-100">
              <div>
                <p className="font-medium text-violet-900 text-sm">{localProduction.formulaName}</p>
                <p className="text-xs text-violet-600">ID: {localProduction.formulaId}</p>
              </div>
              <div className="flex items-center gap-2">
                {isStageCompleted(PRODUCTION_STAGE.FORMULA_SELECTION) && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">Seçildi ✓</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={onFormulaSelect} disabled={disabled} className="h-7 text-xs">
                  Değiştir
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={onFormulaSelect}
              disabled={disabled}
              className="w-full p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-colors flex items-center justify-center gap-2"
            >
              <FlaskConical className="h-4 w-4" />
              <span className="text-sm">Formül Seç</span>
            </button>
          )}

          {/* Stage Switches */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {/* Formula Selection Stage */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              isStageCompleted(PRODUCTION_STAGE.FORMULA_SELECTION) ? "bg-emerald-50 border-emerald-200" : 
              isStageCurrent(PRODUCTION_STAGE.FORMULA_SELECTION) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.FORMULA_SELECTION) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.FORMULA_SELECTION) ? <Check className="h-3 w-3" /> : "1"}
                </div>
                <Label className="text-sm text-slate-700">Formül Seçimi Tamamlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.FORMULA_SELECTION)}
                disabled={true}
                className="opacity-70"
              />
            </div>

            {/* Formula Approval Stage */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              isStageCompleted(PRODUCTION_STAGE.FORMULA_APPROVAL) ? "bg-emerald-50 border-emerald-200" : 
              isStageCurrent(PRODUCTION_STAGE.FORMULA_APPROVAL) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.FORMULA_APPROVAL) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.FORMULA_APPROVAL) ? <Check className="h-3 w-3" /> : "2"}
                </div>
                <Label className="text-sm text-slate-700">Müşteri Formül Onayı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.FORMULA_APPROVAL)}
                onCheckedChange={(v) => handleImmediateChange(null, 'formulaApproved', v)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tasarım Tab - Stages: packaging_design, label_design, box_design, design_approval */}
      <TabsContent value="design" className="mt-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <Palette className="h-4 w-4 text-pink-500" />
            Tasarım Aşamaları
          </h4>

          {/* Ambalaj Tasarımı */}
          <div className="space-y-3">
            <div className={cn(
              "p-3 rounded-lg border",
              isStageCompleted(PRODUCTION_STAGE.PACKAGING_DESIGN) ? "bg-emerald-50 border-emerald-200" : 
              isStageCurrent(PRODUCTION_STAGE.PACKAGING_DESIGN) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                    isStageCompleted(PRODUCTION_STAGE.PACKAGING_DESIGN) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {isStageCompleted(PRODUCTION_STAGE.PACKAGING_DESIGN) ? <Check className="h-3 w-3" /> : "3"}
                  </div>
                  <Label className="text-sm font-medium text-slate-700">Ambalaj Tasarımı</Label>
                </div>
                <Switch
                  checked={isStageCompleted(PRODUCTION_STAGE.PACKAGING_DESIGN)}
                  onCheckedChange={(v) => handleImmediateChange('packaging', 'approved', v)}
                  disabled={disabled}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Select value={localProduction?.packaging?.type || ""} onValueChange={(v) => handleImmediateChange('packaging', 'type', v)} disabled={disabled}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Ambalaj Tipi" /></SelectTrigger>
                  <SelectContent>
                    {PACKAGING_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={localProduction?.packaging?.material || ""} onValueChange={(v) => handleImmediateChange('packaging', 'material', v)} disabled={disabled}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Malzeme" /></SelectTrigger>
                  <SelectContent>
                    {PACKAGING_MATERIALS.map((mat) => (
                      <SelectItem key={mat.id} value={mat.id}>{mat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Etiket Tasarımı */}
            <div className={cn(
              "p-3 rounded-lg border",
              isStageCompleted(PRODUCTION_STAGE.LABEL_DESIGN) ? "bg-emerald-50 border-emerald-200" : 
              isStageCurrent(PRODUCTION_STAGE.LABEL_DESIGN) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                    isStageCompleted(PRODUCTION_STAGE.LABEL_DESIGN) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {isStageCompleted(PRODUCTION_STAGE.LABEL_DESIGN) ? <Check className="h-3 w-3" /> : "4"}
                  </div>
                  <Label className="text-sm font-medium text-slate-700">Etiket Tasarımı</Label>
                </div>
                <Switch
                  checked={isStageCompleted(PRODUCTION_STAGE.LABEL_DESIGN)}
                  onCheckedChange={(v) => handleImmediateChange('label', 'approved', v)}
                  disabled={disabled}
                />
              </div>
              <div className="flex gap-2">
                <Input 
                  value={localProduction?.label?.designerName || ""} 
                  onChange={(e) => handleChange('label', 'designerName', e.target.value)} 
                  placeholder="Tasarımcı" 
                  className="h-8 text-xs flex-1" 
                  disabled={disabled} 
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.eps,.svg"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'label')}
                />
                {localProduction?.label?.designFile ? (
                  <div className="flex items-center gap-1 px-2 bg-emerald-100 rounded text-emerald-700 text-xs">
                    <FileText className="h-3 w-3" />
                    <span className="max-w-20 truncate">{localProduction?.label?.designFileName}</span>
                    <button onClick={() => handleRemoveFile('label')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()} disabled={disabled || uploadingFile === 'label'}>
                    {uploadingFile === 'label' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>

            {/* Kutu Tasarımı */}
            <div className={cn(
              "p-3 rounded-lg border",
              isStageCompleted(PRODUCTION_STAGE.BOX_DESIGN) ? "bg-emerald-50 border-emerald-200" : 
              isStageCurrent(PRODUCTION_STAGE.BOX_DESIGN) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                    isStageCompleted(PRODUCTION_STAGE.BOX_DESIGN) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {isStageCompleted(PRODUCTION_STAGE.BOX_DESIGN) ? <Check className="h-3 w-3" /> : "5"}
                  </div>
                  <Label className="text-sm font-medium text-slate-700">Kutu Tasarımı</Label>
                  <span className="text-xs text-slate-400">(Opsiyonel)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!localProduction?.box?.required}
                    onCheckedChange={(v) => handleImmediateChange('box', 'required', !v)}
                    disabled={disabled}
                    className="scale-75"
                  />
                  <span className="text-xs text-slate-500">Kutu Yok</span>
                  <Switch
                    checked={!!localProduction?.box?.approved}
                    onCheckedChange={(v) => handleImmediateChange('box', 'approved', v)}
                    disabled={disabled || !localProduction?.box?.required}
                  />
                </div>
              </div>
              {localProduction?.box?.required && (
                <div className="flex gap-2">
                  <Input 
                    value={localProduction?.box?.dimensions || ""} 
                    onChange={(e) => handleChange('box', 'dimensions', e.target.value)} 
                    placeholder="Boyutlar" 
                    className="h-8 text-xs flex-1" 
                    disabled={disabled} 
                  />
                  <input
                    ref={boxFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.eps,.svg"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'box')}
                  />
                  {localProduction?.box?.designFile ? (
                    <div className="flex items-center gap-1 px-2 bg-emerald-100 rounded text-emerald-700 text-xs">
                      <FileText className="h-3 w-3" />
                      <button onClick={() => handleRemoveFile('box')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => boxFileInputRef.current?.click()} disabled={disabled || uploadingFile === 'box'}>
                      {uploadingFile === 'box' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Tasarım Onayları */}
            <div className={cn(
              "p-3 rounded-lg border",
              isStageCompleted(PRODUCTION_STAGE.DESIGN_APPROVAL) ? "bg-emerald-50 border-emerald-200" : 
              isStageCurrent(PRODUCTION_STAGE.DESIGN_APPROVAL) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                    isStageCompleted(PRODUCTION_STAGE.DESIGN_APPROVAL) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {isStageCompleted(PRODUCTION_STAGE.DESIGN_APPROVAL) ? <Check className="h-3 w-3" /> : "6"}
                  </div>
                  <Label className="text-sm font-medium text-slate-700">Tüm Tasarımlar Onaylandı</Label>
                </div>
                <Switch
                  checked={isStageCompleted(PRODUCTION_STAGE.DESIGN_APPROVAL)}
                  onCheckedChange={(v) => handleImmediateChange(null, 'designsApproved', v)}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tedarik Tab - Stages: raw_material, packaging_supply */}
      <TabsContent value="supply" className="mt-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <Truck className="h-4 w-4 text-sky-500" />
            Tedarik Aşamaları
          </h4>

          {/* Hammadde Tedarik */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.RAW_MATERIAL) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.RAW_MATERIAL) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.RAW_MATERIAL) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.RAW_MATERIAL) ? <Check className="h-3 w-3" /> : "7"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Hammadde Tedarik Edildi</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.RAW_MATERIAL)}
                onCheckedChange={(v) => handleImmediateChange('supply', 'rawMaterialReceived', v)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                value={localProduction?.supply?.rawMaterialSupplier || ""} 
                onChange={(e) => handleChange('supply', 'rawMaterialSupplier', e.target.value)} 
                placeholder="Tedarikçi" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="date"
                value={localProduction?.supply?.rawMaterialDate || ""} 
                onChange={(e) => handleChange('supply', 'rawMaterialDate', e.target.value)} 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
            </div>
          </div>

          {/* Ambalaj Tedarik */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.PACKAGING_SUPPLY) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.PACKAGING_SUPPLY) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.PACKAGING_SUPPLY) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.PACKAGING_SUPPLY) ? <Check className="h-3 w-3" /> : "8"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Ambalaj Tedarik Edildi</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.PACKAGING_SUPPLY)}
                onCheckedChange={(v) => handleImmediateChange('supply', 'packagingReceived', v)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                value={localProduction?.supply?.packagingSupplier || ""} 
                onChange={(e) => handleChange('supply', 'packagingSupplier', e.target.value)} 
                placeholder="Ambalaj Tedarikçisi" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="date"
                value={localProduction?.supply?.packagingDate || ""} 
                onChange={(e) => handleChange('supply', 'packagingDate', e.target.value)} 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
            </div>
          </div>

          {/* Etiket Tedarik */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.LABEL_SUPPLY) ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.LABEL_SUPPLY) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.LABEL_SUPPLY) ? <Check className="h-3 w-3" /> : "9"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Etiket Tedarik Edildi</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.LABEL_SUPPLY)}
                onCheckedChange={(v) => handleImmediateChange('supply', 'labelReceived', v)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                value={localProduction?.supply?.labelSupplier || ""} 
                onChange={(e) => handleChange('supply', 'labelSupplier', e.target.value)} 
                placeholder="Etiket Tedarikçisi" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="date"
                value={localProduction?.supply?.labelDate || ""} 
                onChange={(e) => handleChange('supply', 'labelDate', e.target.value)} 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
            </div>
          </div>

          {/* Kutu Tedarik */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.BOX_SUPPLY) ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.BOX_SUPPLY) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.BOX_SUPPLY) ? <Check className="h-3 w-3" /> : "10"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Kutu Tedarik Edildi</Label>
                <span className="text-xs text-slate-400">(Opsiyonel)</span>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.BOX_SUPPLY)}
                onCheckedChange={(v) => handleImmediateChange('supply', 'boxReceived', v)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                value={localProduction?.supply?.boxSupplier || ""} 
                onChange={(e) => handleChange('supply', 'boxSupplier', e.target.value)} 
                placeholder="Kutu Tedarikçisi" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="date"
                value={localProduction?.supply?.boxDate || ""} 
                onChange={(e) => handleChange('supply', 'boxDate', e.target.value)} 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Üretim Tab - Stages: production_planning, production, filling, quality_control */}
      <TabsContent value="production" className="mt-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <Factory className="h-4 w-4 text-emerald-500" />
            Üretim Aşamaları
          </h4>

          {/* Üretim Planlama */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.PRODUCTION_PLANNING) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.PRODUCTION_PLANNING) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.PRODUCTION_PLANNING) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.PRODUCTION_PLANNING) ? <Check className="h-3 w-3" /> : "11"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Üretim Planlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.PRODUCTION_PLANNING)}
                onCheckedChange={(v) => handleImmediateChange(null, 'productionPlanned', v)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input 
                value={localProduction?.batchNumber || ""} 
                onChange={(e) => handleChange(null, 'batchNumber', e.target.value)} 
                placeholder="Batch No" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                value={localProduction?.lotNumber || ""} 
                onChange={(e) => handleChange(null, 'lotNumber', e.target.value)} 
                placeholder="Lot No" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="number"
                value={localProduction?.plannedQuantity || ""} 
                onChange={(e) => handleChange(null, 'plannedQuantity', parseInt(e.target.value) || 0)} 
                placeholder="Miktar" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
            </div>
          </div>

          {/* Üretim */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.PRODUCTION) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.PRODUCTION) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.PRODUCTION) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.PRODUCTION) ? <Check className="h-3 w-3" /> : "12"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Üretim Tamamlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.PRODUCTION)}
                onCheckedChange={(v) => handleImmediateChange(null, 'productionCompleted', v)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Dolum */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.FILLING) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.FILLING) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.FILLING) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.FILLING) ? <Check className="h-3 w-3" /> : "13"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Dolum Tamamlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.FILLING)}
                onCheckedChange={(v) => handleImmediateChange(null, 'fillingCompleted', v)}
                disabled={disabled}
              />
            </div>
            <Input 
              value={localProduction?.fillVolume || ""} 
              onChange={(e) => handleChange(null, 'fillVolume', e.target.value)} 
              placeholder="Dolum Hacmi (örn: 50ml)" 
              className="h-8 text-xs" 
              disabled={disabled} 
            />
          </div>

          {/* Kalite Kontrol */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.QUALITY_CONTROL) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.QUALITY_CONTROL) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.QUALITY_CONTROL) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.QUALITY_CONTROL) ? <Check className="h-3 w-3" /> : "14"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Kalite Kontrol Onaylandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.QUALITY_CONTROL)}
                onCheckedChange={(v) => handleImmediateChange(null, 'qcApproved', v)}
                disabled={disabled}
              />
            </div>
            <Textarea 
              value={localProduction?.qcNotes || ""} 
              onChange={(e) => handleChange(null, 'qcNotes', e.target.value)} 
              placeholder="Kalite kontrol notları..." 
              rows={2} 
              className="text-xs" 
              disabled={disabled} 
            />
          </div>
        </div>
      </TabsContent>

      {/* Paketleme Tab - Stages: labeling, boxing, final_packaging, ready_for_delivery */}
      <TabsContent value="packaging" className="mt-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-500" />
            Paketleme & Teslim
          </h4>

          {/* Etiketleme */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.LABELING) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.LABELING) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.LABELING) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.LABELING) ? <Check className="h-3 w-3" /> : "15"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Etiketleme Tamamlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.LABELING)}
                onCheckedChange={(v) => handleImmediateChange(null, 'labelingCompleted', v)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Kutulama */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.BOXING) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.BOXING) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.BOXING) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.BOXING) ? <Check className="h-3 w-3" /> : "16"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Kutulama Tamamlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.BOXING)}
                onCheckedChange={(v) => handleImmediateChange(null, 'boxingCompleted', v)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Final Paketleme */}
          <div className={cn(
            "p-3 rounded-lg border",
            isStageCompleted(PRODUCTION_STAGE.FINAL_PACKAGING) ? "bg-emerald-50 border-emerald-200" : 
            isStageCurrent(PRODUCTION_STAGE.FINAL_PACKAGING) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                  isStageCompleted(PRODUCTION_STAGE.FINAL_PACKAGING) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.FINAL_PACKAGING) ? <Check className="h-3 w-3" /> : "17"}
                </div>
                <Label className="text-sm font-medium text-slate-700">Son Paketleme Tamamlandı</Label>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.FINAL_PACKAGING)}
                onCheckedChange={(v) => handleImmediateChange(null, 'finalPackagingCompleted', v)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input 
                type="number"
                value={localProduction?.packagingInfo?.unitsPerCarton || ""} 
                onChange={(e) => handleChange('packagingInfo', 'unitsPerCarton', parseInt(e.target.value) || null)} 
                placeholder="Koli/Adet" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="number"
                value={localProduction?.packagingInfo?.totalCartons || ""} 
                onChange={(e) => handleChange('packagingInfo', 'totalCartons', parseInt(e.target.value) || null)} 
                placeholder="Toplam Koli" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                type="number"
                value={localProduction?.packagingInfo?.palletCount || ""} 
                onChange={(e) => handleChange('packagingInfo', 'palletCount', parseInt(e.target.value) || null)} 
                placeholder="Palet" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
              <Input 
                value={localProduction?.packagingInfo?.totalWeight || ""} 
                onChange={(e) => handleChange('packagingInfo', 'totalWeight', e.target.value)} 
                placeholder="Ağırlık (kg)" 
                className="h-8 text-xs" 
                disabled={disabled} 
              />
            </div>
          </div>

          {/* Teslimata Hazır */}
          <div className={cn(
            "p-3 rounded-lg border-2",
            isStageCompleted(PRODUCTION_STAGE.READY_FOR_DELIVERY) ? "bg-emerald-100 border-emerald-400" : 
            isStageCurrent(PRODUCTION_STAGE.READY_FOR_DELIVERY) ? "bg-blue-100 border-blue-400" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isStageCompleted(PRODUCTION_STAGE.READY_FOR_DELIVERY) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isStageCompleted(PRODUCTION_STAGE.READY_FOR_DELIVERY) ? <Check className="h-4 w-4" /> : "18"}
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-900">Teslimata Hazır</Label>
                  <p className="text-xs text-slate-500">Sipariş tamamlandı, teslim edilebilir</p>
                </div>
              </div>
              <Switch
                checked={isStageCompleted(PRODUCTION_STAGE.READY_FOR_DELIVERY)}
                onCheckedChange={(v) => handleImmediateChange(null, 'readyForDelivery', v)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

/**
 * Checklist Component - Production Data ile Senkronize
 * 
 * Bu component üstteki Timeline ile aynı production verisini kullanır.
 * Stage tamamlanma durumu production boolean'larından gelir.
 */
export function ProductionChecklist({
  checklist = [],
  production = {},
  currentStage,
  onItemToggle,
  onAddItem,
  onDeleteItem,
  disabled = false,
}) {
  const [newTask, setNewTask] = useState("");
  const stages = getProductionStageOrder();

  // Production verisinden stage tamamlanma durumunu kontrol et
  // (Timeline ile AYNI mantık)
  const isStageCompletedFromProduction = (stage) => {
    switch (stage) {
      case PRODUCTION_STAGE.FORMULA_SELECTION:
        return !!production?.formulaId;
      case PRODUCTION_STAGE.FORMULA_APPROVAL:
        return !!production?.formulaApproved;
      case PRODUCTION_STAGE.PACKAGING_DESIGN:
        return !!production?.packaging?.approved;
      case PRODUCTION_STAGE.LABEL_DESIGN:
        return !!production?.label?.approved;
      case PRODUCTION_STAGE.BOX_DESIGN:
        return !!production?.box?.approved || !production?.box?.required;
      case PRODUCTION_STAGE.DESIGN_APPROVAL:
        return !!production?.designsApproved;
      case PRODUCTION_STAGE.RAW_MATERIAL:
        return !!production?.supply?.rawMaterialReceived;
      case PRODUCTION_STAGE.PACKAGING_SUPPLY:
        return !!production?.supply?.packagingReceived;
      case PRODUCTION_STAGE.LABEL_SUPPLY:
        return !!production?.supply?.labelReceived;
      case PRODUCTION_STAGE.BOX_SUPPLY:
        return !!production?.supply?.boxReceived || !production?.box?.required;
      case PRODUCTION_STAGE.PRODUCTION_PLANNING:
        return !!production?.productionPlanned;
      case PRODUCTION_STAGE.PRODUCTION:
        return !!production?.productionCompleted;
      case PRODUCTION_STAGE.FILLING:
        return !!production?.fillingCompleted;
      case PRODUCTION_STAGE.QUALITY_CONTROL:
        return !!production?.qcApproved;
      case PRODUCTION_STAGE.LABELING:
        return !!production?.labelingCompleted;
      case PRODUCTION_STAGE.BOXING:
        return !!production?.boxingCompleted;
      case PRODUCTION_STAGE.FINAL_PACKAGING:
        return !!production?.finalPackagingCompleted;
      case PRODUCTION_STAGE.READY_FOR_DELIVERY:
        return !!production?.readyForDelivery;
      default:
        return false;
    }
  };

  // Checklist'i aşamalara göre grupla
  const groupedChecklist = {};
  stages.forEach(stage => {
    groupedChecklist[stage] = checklist.filter(item => item.stage === stage);
  });

  // Sadece checklist item'ı olan stage'leri filtrele
  const stagesWithItems = stages.filter(stage => (groupedChecklist[stage] || []).length > 0);

  const handleAddTask = () => {
    if (newTask.trim() && onAddItem) {
      onAddItem({
        stage: currentStage,
        task: newTask.trim(),
      });
      setNewTask("");
    }
  };

  // Tamamlanma hesabı: Production'dan gelen stage durumlarını say
  const completedStagesCount = stagesWithItems.filter(s => isStageCompletedFromProduction(s)).length;
  const totalStagesCount = stagesWithItems.length;
  const completionPercent = totalStagesCount > 0 ? Math.round((completedStagesCount / totalStagesCount) * 100) : 0;

  // İlk tamamlanmamış stage = sıradaki
  const calculatedCurrentStage = stages.find(s => !isStageCompletedFromProduction(s)) || stages[stages.length - 1];

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-sm text-slate-900">Kontrol Listesi</span>
          <span className="text-xs text-slate-400">{completedStagesCount}/{totalStagesCount} aşama</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={completionPercent} className="w-20 h-1.5" />
          <span className="text-xs font-medium text-slate-600">%{completionPercent}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-h-[300px] overflow-y-auto">
        <Accordion type="multiple" defaultValue={[calculatedCurrentStage]} className="w-full">
          {stagesWithItems.map(stage => {
            const items = groupedChecklist[stage] || [];
            const stageIndex = stages.indexOf(stage);
            
            // Production'dan stage durumu
            const isStageComplete = isStageCompletedFromProduction(stage);
            const isCurrent = stage === calculatedCurrentStage;
            
            // Checklist item tamamlanma sayısı (bilgi amaçlı)
            const completedItemsInStage = items.filter(i => i.completed).length;
            
            return (
              <AccordionItem key={stage} value={stage} className="border-b border-slate-100 last:border-0">
                <AccordionTrigger className="hover:no-underline px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-medium",
                      isStageComplete && "bg-emerald-500 text-white",
                      isCurrent && !isStageComplete && "bg-blue-500 text-white",
                      !isStageComplete && !isCurrent && "bg-slate-200 text-slate-500"
                    )}>
                      {isStageComplete ? <Check className="h-3 w-3" /> : stageIndex + 1}
                    </div>
                    <span className={cn(
                      "text-sm",
                      isStageComplete && "text-emerald-700 font-medium",
                      isCurrent && !isStageComplete && "text-blue-600 font-medium"
                    )}>
                      {getProductionStageLabel(stage)}
                    </span>
                    {isStageComplete ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                        Tamamlandı
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">{completedItemsInStage}/{items.length}</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-1.5 ml-7">
                    {items.map(item => (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded",
                          isStageComplete ? "bg-emerald-50" : item.completed ? "bg-amber-50" : "bg-slate-50"
                        )}
                      >
                        <Checkbox
                          checked={isStageComplete || item.completed}
                          onCheckedChange={(checked) => onItemToggle?.(item.id, checked)}
                          disabled={disabled || isStageComplete}
                          className="h-4 w-4"
                        />
                        <span className={cn(
                          "flex-1 text-sm",
                          (isStageComplete || item.completed) && "line-through text-slate-400"
                        )}>
                          {item.task}
                        </span>
                        {item.isCustom && !isStageComplete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDeleteItem?.(item.id)}
                            disabled={disabled}
                          >
                            <Trash2 className="h-3 w-3 text-slate-400" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {/* Aktif aşama için yeni görev */}
                    {isCurrent && !disabled && !isStageComplete && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        <Input
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          placeholder="Yeni görev..."
                          className="flex-1 h-8 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                        <Button variant="outline" size="sm" onClick={handleAddTask} disabled={!newTask.trim()} className="h-8 px-2">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

export default {
  ProductionWorkflowTimeline,
  ProductionDetailsForm,
  ProductionChecklist,
};
