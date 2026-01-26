"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  getReminders,
  getReminderStats,
  completeReminder,
  snoozeReminder as snoozeReminderService,
  dismissReminder,
  deleteReminder,
  createReminder,
  getOverdueReminders,
  getTodayReminders,
  REMINDER_ENTITY_TYPE,
  getEntityTypeLabel,
  isReminderOverdue,
  formatReminderDue,
} from "../../../../lib/services/crm-v2";
import {
  REMINDER_TYPE,
  REMINDER_STATUS,
  getReminderTypeLabel,
  getReminderTypeColor,
  getReminderStatusLabel,
  getReminderTypeIcon,
} from "../../../../lib/services/crm-v2/schema";
import { getCustomers } from "../../../../lib/services/crm-v2/customer-service";
import { formatDistanceToNow, format, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../lib/utils";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

// Icons
import {
  Bell,
  Plus,
  RefreshCw,
  Check,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  CheckCircle2,
  XCircle,
  AlarmClock,
  Video,
  Users,
  Phone,
  FileText,
  DollarSign,
  Briefcase,
  User,
  MessageSquare,
  ShoppingCart,
  Loader2,
  ChevronRight,
  CalendarDays,
  ListFilter,
  LayoutGrid,
} from "lucide-react";

// Icon mapping for reminder types
const REMINDER_ICONS = {
  follow_up: RefreshCw,
  deadline: AlertTriangle,
  sla_warning: Clock,
  custom: Bell,
  quote_follow_up: FileText,
  inactivity: Clock,
  online_meeting: Video,
  face_to_face: Users,
  call: Phone,
  price_quote: DollarSign,
};

// Entity type icons
const ENTITY_ICONS = {
  case: Briefcase,
  customer: User,
  conversation: MessageSquare,
  order: ShoppingCart,
  general: Bell,
};

export default function RemindersPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list, calendar
  const [selectedReminders, setSelectedReminders] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterEntityType, setFilterEntityType] = useState("all");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  
  // Form state
  const [reminderForm, setReminderForm] = useState({
    title: "",
    description: "",
    type: REMINDER_TYPE.FOLLOW_UP,
    dueDate: "",
    dueTime: "",
    priority: "normal",
    location: "",
    meetingLink: "",
  });
  const [saving, setSaving] = useState(false);
  
  // Snooze options
  const [snoozeMinutes, setSnoozeMinutes] = useState(60);

  // Load reminders
  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build filter options
      const options = {
        includeCompleted: filterStatus === "all" || filterStatus === "completed",
        limitCount: 200,
      };
      
      if (filterStatus === "active") {
        options.status = null; // Will use default active filter
      } else if (filterStatus === "completed") {
        options.status = REMINDER_STATUS.COMPLETED;
      }
      
      if (filterType !== "all") {
        options.type = filterType;
      }
      
      if (filterEntityType !== "all") {
        options.entityType = filterEntityType;
      }
      
      // Load reminders and stats in parallel
      const [remindersData, statsData] = await Promise.all([
        getReminders(options),
        getReminderStats(user?.uid),
      ]);
      
      setReminders(remindersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading reminders:", error);
      toast({
        title: "Hata",
        description: "Hatırlatmalar yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterEntityType, user?.uid, toast]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // Filtered reminders based on tab and search
  const filteredReminders = reminders.filter(reminder => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        reminder.title?.toLowerCase().includes(search) ||
        reminder.description?.toLowerCase().includes(search) ||
        reminder.customerName?.toLowerCase().includes(search) ||
        reminder.entityTitle?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Tab filter
    if (activeTab === "overdue") {
      return isReminderOverdue(reminder);
    } else if (activeTab === "today") {
      if (!reminder.dueDate) return false;
      const dueDate = reminder.dueDate.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
      return isToday(dueDate);
    } else if (activeTab === "upcoming") {
      if (!reminder.dueDate) return false;
      const dueDate = reminder.dueDate.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
      return !isPast(dueDate) && !isToday(dueDate);
    } else if (activeTab === "completed") {
      return reminder.status === REMINDER_STATUS.COMPLETED;
    }
    
    return true;
  });

  // Group reminders by date for calendar view
  const groupedReminders = filteredReminders.reduce((groups, reminder) => {
    if (!reminder.dueDate) {
      if (!groups['no_date']) groups['no_date'] = [];
      groups['no_date'].push(reminder);
      return groups;
    }
    
    const dueDate = reminder.dueDate.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
    const dateKey = format(dueDate, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(reminder);
    
    return groups;
  }, {});

  // Handlers
  const handleCreateReminder = async () => {
    if (!reminderForm.title || !reminderForm.dueDate) {
      toast({
        title: "Hata",
        description: "Başlık ve tarih zorunludur",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      // Combine date and time
      let dueDateTime = reminderForm.dueDate;
      if (reminderForm.dueTime) {
        dueDateTime = `${reminderForm.dueDate}T${reminderForm.dueTime}`;
      }
      
      await createReminder({
        ...reminderForm,
        dueDate: dueDateTime,
        createdBy: user?.uid,
        createdByName: user?.displayName || user?.email,
        entityType: REMINDER_ENTITY_TYPE.GENERAL,
      });
      
      toast({
        title: "Başarılı",
        description: "Hatırlatma oluşturuldu",
      });
      
      setShowCreateModal(false);
      setReminderForm({
        title: "",
        description: "",
        type: REMINDER_TYPE.FOLLOW_UP,
        dueDate: "",
        dueTime: "",
        priority: "normal",
        location: "",
        meetingLink: "",
      });
      
      loadReminders();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hatırlatma oluşturulamadı",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (reminder) => {
    try {
      await completeReminder(reminder.id, user?.uid);
      toast({
        title: "Başarılı",
        description: "Hatırlatma tamamlandı",
      });
      loadReminders();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    }
  };

  const handleSnooze = async () => {
    if (!selectedReminder) return;
    
    try {
      await snoozeReminderService(selectedReminder.id, snoozeMinutes, user?.uid);
      toast({
        title: "Başarılı",
        description: `Hatırlatma ${snoozeMinutes} dakika ertelendi`,
      });
      setShowSnoozeModal(false);
      setSelectedReminder(null);
      loadReminders();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Erteleme başarısız",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (reminder) => {
    try {
      await dismissReminder(reminder.id, user?.uid);
      toast({
        title: "Başarılı",
        description: "Hatırlatma iptal edildi",
      });
      loadReminders();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;
    
    try {
      await deleteReminder(selectedReminder.id);
      toast({
        title: "Başarılı",
        description: "Hatırlatma silindi",
      });
      setShowDeleteDialog(false);
      setSelectedReminder(null);
      loadReminders();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silme başarısız",
        variant: "destructive",
      });
    }
  };

  const toggleSelectReminder = (reminderId) => {
    setSelectedReminders(prev => 
      prev.includes(reminderId)
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredReminders.map(r => r.id);
    setSelectedReminders(visibleIds);
  };

  const deselectAll = () => {
    setSelectedReminders([]);
  };

  // Format due date for display
  const formatDueDate = (reminder) => {
    if (!reminder.dueDate) return "Tarih yok";
    
    const dueDate = reminder.dueDate.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
    
    if (isToday(dueDate)) {
      return `Bugün ${format(dueDate, 'HH:mm')}`;
    } else if (isTomorrow(dueDate)) {
      return `Yarın ${format(dueDate, 'HH:mm')}`;
    } else if (isPast(dueDate)) {
      return formatDistanceToNow(dueDate, { addSuffix: true, locale: tr });
    } else {
      return format(dueDate, 'd MMM yyyy HH:mm', { locale: tr });
    }
  };

  // Get entity link
  const getEntityLink = (reminder) => {
    if (!reminder.entityId) return null;
    
    switch (reminder.entityType) {
      case REMINDER_ENTITY_TYPE.CASE:
        return `/admin/crm-v2/cases/${reminder.entityId}`;
      case REMINDER_ENTITY_TYPE.CUSTOMER:
        return `/admin/crm-v2/customers/${reminder.entityId}`;
      case REMINDER_ENTITY_TYPE.CONVERSATION:
        return `/admin/crm-v2/inbox?conversation=${reminder.entityId}`;
      case REMINDER_ENTITY_TYPE.ORDER:
        return `/admin/crm-v2/orders/${reminder.entityId}`;
      default:
        return null;
    }
  };

  // Render reminder card
  const ReminderCard = ({ reminder }) => {
    const isOverdue = isReminderOverdue(reminder);
    const TypeIcon = REMINDER_ICONS[reminder.type] || Bell;
    const EntityIcon = ENTITY_ICONS[reminder.entityType] || Bell;
    const entityLink = getEntityLink(reminder);
    
    return (
      <div
        className={cn(
          "group flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors",
          isOverdue && reminder.status !== REMINDER_STATUS.COMPLETED && "bg-red-50/50",
          reminder.status === REMINDER_STATUS.COMPLETED && "opacity-60",
          selectedReminders.includes(reminder.id) && "bg-blue-50"
        )}
      >
        {/* Checkbox */}
        <Checkbox
          checked={selectedReminders.includes(reminder.id)}
          onCheckedChange={() => toggleSelectReminder(reminder.id)}
          className="mt-1"
        />
        
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          getReminderTypeColor(reminder.type)
        )}>
          <TypeIcon className="w-5 h-5" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "font-medium text-slate-900",
              reminder.status === REMINDER_STATUS.COMPLETED && "line-through"
            )}>
              {reminder.title}
              </h4>
              <Badge variant="outline" className={cn("text-xs", getReminderTypeColor(reminder.type))}>
                {getReminderTypeLabel(reminder.type)}
              </Badge>
              {isOverdue && reminder.status !== REMINDER_STATUS.COMPLETED && (
                <Badge variant="destructive" className="text-xs">
                  Gecikmiş
                </Badge>
              )}
            </div>
            
            {reminder.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{reminder.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className={cn(
                "flex items-center gap-1",
                isOverdue && reminder.status !== REMINDER_STATUS.COMPLETED && "text-red-600 font-medium"
              )}>
                <Clock className="w-3 h-3" />
                {formatDueDate(reminder)}
              </span>
              
              {entityLink && (
                <Link href={entityLink} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  <EntityIcon className="w-3 h-3" />
                  {reminder.entityTitle || getEntityTypeLabel(reminder.entityType)}
                </Link>
              )}
              
              {reminder.customerName && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {reminder.customerName}
                </span>
              )}
            </div>
          </div>
          
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {reminder.status !== REMINDER_STATUS.COMPLETED && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleComplete(reminder)}
                title="Tamamla"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => {
                  setSelectedReminder(reminder);
                  setShowSnoozeModal(true);
                }}
                title="Ertele"
              >
                <AlarmClock className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {reminder.status !== REMINDER_STATUS.COMPLETED && (
                  <>
                    <DropdownMenuItem onClick={() => handleComplete(reminder)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Tamamla
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedReminder(reminder);
                      setShowSnoozeModal(true);
                    }}>
                      <AlarmClock className="w-4 h-4 mr-2" />
                      Ertele
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDismiss(reminder)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      İptal Et
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedReminder(reminder);
                    setShowDeleteDialog(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-16 bg-slate-200" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-slate-200" />
          ))}
        </div>
        <Skeleton className="h-96 bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hatırlatmalar</h1>
          <p className="text-slate-500">Tüm hatırlatmalarınızı yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReminders} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Yenile
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hatırlatma
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Gecikmiş</CardTitle>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.overdue}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bugün</CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg">
                <CalendarDays className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.today}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bu Hafta</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.thisWeek}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Toplam Aktif</CardTitle>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Bell className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Hatırlatma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {Object.entries(REMINDER_TYPE).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {getReminderTypeLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="all">Tümü</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterEntityType} onValueChange={setFilterEntityType}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="Kaynak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                {Object.entries(REMINDER_ENTITY_TYPE).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {getEntityTypeLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center border border-slate-200 rounded-lg">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                <ListFilter className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("calendar")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Card with Tabs */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b-0 p-0 h-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Tümü
                <Badge variant="secondary" className="ml-2 bg-slate-100">
                  {reminders.filter(r => r.status !== REMINDER_STATUS.COMPLETED).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="overdue" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-4 py-3"
              >
                Gecikmiş
                {stats?.overdue > 0 && (
                  <Badge className="ml-2 bg-red-500">{stats.overdue}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="today" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-600 rounded-none px-4 py-3"
              >
                Bugün
                {stats?.today > 0 && (
                  <Badge className="ml-2 bg-amber-500">{stats.today}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Yaklaşan
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-3"
              >
                Tamamlanan
              </TabsTrigger>
            </TabsList>

          </Tabs>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Selection actions */}
          {selectedReminders.length > 0 && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border-b border-blue-100">
              <span className="text-sm text-blue-700">
                {selectedReminders.length} hatırlatma seçildi
              </span>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Seçimi Kaldır
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={async () => {
                  for (const id of selectedReminders) {
                    await completeReminder(id, user?.uid);
                  }
                  setSelectedReminders([]);
                  loadReminders();
                  toast({ title: "Başarılı", description: "Seçili hatırlatmalar tamamlandı" });
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Tümünü Tamamla
              </Button>
            </div>
          )}

          {/* Content */}
          {filteredReminders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Hatırlatma Bulunamadı</h3>
              <p className="text-slate-500 mt-1">
                {activeTab === "overdue" && "Gecikmiş hatırlatma yok 🎉"}
                {activeTab === "today" && "Bugün için hatırlatma yok"}
                {activeTab === "completed" && "Henüz tamamlanan hatırlatma yok"}
                {activeTab === "all" && "Yeni bir hatırlatma ekleyerek başlayın"}
              </p>
              {activeTab === "all" && (
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Hatırlatmanı Ekle
                </Button>
              )}
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-slate-100">
              {filteredReminders.map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(groupedReminders)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([dateKey, dateReminders]) => (
                  <div key={dateKey}>
                    <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {dateKey === 'no_date' 
                        ? 'Tarih Belirtilmemiş'
                        : format(new Date(dateKey), 'd MMMM yyyy, EEEE', { locale: tr })
                      }
                      <Badge variant="secondary" className="bg-slate-100">{dateReminders.length}</Badge>
                    </h3>
                    <div className="space-y-2 pl-6 border-l-2 border-slate-100">
                      {dateReminders.map(reminder => (
                        <ReminderCard key={reminder.id} reminder={reminder} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Reminder Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Yeni Hatırlatma</DialogTitle>
            <DialogDescription>Kendinize veya ekibinize bir hatırlatma oluşturun</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Tür</Label>
              <Select
                value={reminderForm.type}
                onValueChange={(v) => setReminderForm({ ...reminderForm, type: v })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REMINDER_TYPE).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {getReminderTypeLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Başlık *</Label>
              <Input
                value={reminderForm.title}
                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                placeholder="Hatırlatma başlığı"
                className="border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Tarih *</Label>
                <Input
                  type="date"
                  value={reminderForm.dueDate}
                  onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Saat</Label>
                <Input
                  type="time"
                  value={reminderForm.dueTime}
                  onChange={(e) => setReminderForm({ ...reminderForm, dueTime: e.target.value })}
                  className="border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Öncelik</Label>
              <Select
                value={reminderForm.priority}
                onValueChange={(v) => setReminderForm({ ...reminderForm, priority: v })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(reminderForm.type === REMINDER_TYPE.FACE_TO_FACE || 
              reminderForm.type === REMINDER_TYPE.ONLINE_MEETING) && (
              <div className="space-y-2">
                <Label className="text-slate-700">
                  {reminderForm.type === REMINDER_TYPE.ONLINE_MEETING ? "Toplantı Linki" : "Konum"}
                </Label>
                <Input
                  value={reminderForm.type === REMINDER_TYPE.ONLINE_MEETING 
                    ? reminderForm.meetingLink 
                    : reminderForm.location
                  }
                  onChange={(e) => setReminderForm({ 
                    ...reminderForm, 
                    [reminderForm.type === REMINDER_TYPE.ONLINE_MEETING 
                      ? 'meetingLink' 
                      : 'location'
                    ]: e.target.value 
                  })}
                  placeholder={
                    reminderForm.type === REMINDER_TYPE.ONLINE_MEETING
                      ? "https://meet.google.com/..."
                      : "Toplantı yeri"
                  }
                  className="border-slate-200"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700">Açıklama</Label>
              <Textarea
                value={reminderForm.description}
                onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                placeholder="İsteğe bağlı açıklama"
                rows={3}
                className="border-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateReminder} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snooze Modal */}
      <Dialog open={showSnoozeModal} onOpenChange={setShowSnoozeModal}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Hatırlatmayı Ertele</DialogTitle>
            <DialogDescription>Ne kadar süre ertelemek istersiniz?</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 py-4">
            {[
              { label: "15 dk", value: 15 },
              { label: "30 dk", value: 30 },
              { label: "1 saat", value: 60 },
              { label: "2 saat", value: 120 },
              { label: "4 saat", value: 240 },
              { label: "1 gün", value: 1440 },
              { label: "3 gün", value: 4320 },
              { label: "1 hafta", value: 10080 },
            ].map((option) => (
              <Button
                key={option.value}
                variant={snoozeMinutes === option.value ? "default" : "outline"}
                className="w-full"
                onClick={() => setSnoozeMinutes(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSnoozeModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSnooze}>
              <AlarmClock className="w-4 h-4 mr-2" />
              Ertele
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hatırlatmayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hatırlatmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
