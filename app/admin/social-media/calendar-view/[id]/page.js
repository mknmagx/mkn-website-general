"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import * as socialMediaService from "@/lib/services/social-media-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PermissionGuard,
  usePermissions,
} from "@/components/admin-route-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Download,
  Save,
  Edit2,
  Clock,
  FileText,
  Filter,
  Grid3x3,
  List,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import MobilePreview from "@/components/admin/mobile-preview";
import DayEditorPanel from "@/components/admin/day-editor-panel";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 border-2 border-primary/20 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-primary/40 rounded-full animate-pulse" />
        </div>

        {/* Center icon */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm">
            <CalendarIcon className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex space-x-1">
            <span
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  ),
});

const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "#F56565", // Soft coral red
    lightColor: "#FED7D7", // Very light pink
    darkColor: "#C53030", // Deep red
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "#4299E1", // Soft blue
    lightColor: "#BEE3F8", // Very light blue
    darkColor: "#2B6CB0", // Deep blue
  },
  {
    value: "x",
    label: "X",
    icon: Twitter,
    color: "#4A5568", // Soft dark gray
    lightColor: "#E2E8F0", // Very light gray
    darkColor: "#2D3748", // Deep gray
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "#4299E1", // Soft sky blue
    lightColor: "#BEE3F8", // Very light blue
    darkColor: "#2C5282", // Deep blue
  },
];

const CONTENT_TYPE_EMOJIS = {
  post: "📝",
  reel: "🎬",
  story: "📸",
  video: "🎥",
  tweet: "🐦",
  thread: "🧵",
  carousel: "📊",
  article: "📄",
};

export default function CalendarSetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const [calendarSet, setCalendarSet] = useState(null);
  const [allContents, setAllContents] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [viewMode, setViewMode] = useState("calendar");
  const [calendarPlugins, setCalendarPlugins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [showDayEditor, setShowDayEditor] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const loadPlugins = async () => {
      const dayGridPlugin = (await import("@fullcalendar/daygrid")).default;
      const timeGridPlugin = (await import("@fullcalendar/timegrid")).default;
      const interactionPlugin = (await import("@fullcalendar/interaction"))
        .default;

      setCalendarPlugins([dayGridPlugin, timeGridPlugin, interactionPlugin]);
    };

    loadPlugins();
  }, []);

  useEffect(() => {
    if (params.id) {
      loadCalendarSet();
      loadAllContents();
    }
  }, [params.id]);

  // Auto-open day editor if date parameter is present
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && calendarSet && !loading) {
      setSelectedDate(dateParam);
      setShowDayEditor(true);
    }
  }, [searchParams, calendarSet, loading]);

  const loadCalendarSet = async () => {
    try {
      setLoading(true);
      const plans = await socialMediaService.getCalendarPlans();
      const set = plans.find((p) => p.id === params.id);

      if (!set) {
        toast.error("Takvim seti bulunamadı");
        router.push("/admin/social-media/calendar-view");
        return;
      }

      setCalendarSet(set);
      setEditForm({ name: set.name, description: set.description || "" });

      // Convert events to calendar format
      const calendarEvents = (set.events || []).map((event) => {
        const platformData = PLATFORMS.find((p) => p.value === event.platform);
        const platformEmoji =
          {
            instagram: "📷",
            facebook: "📘",
            x: "🐦",
            linkedin: "💼",
          }[event.platform] || "📱";

        const contentTypeEmoji = CONTENT_TYPE_EMOJIS[event.contentType] || "📝";

        // Check if event has time or is all-day
        const startStr = event.start || event.scheduledDate;
        const hasTime =
          startStr &&
          startStr.includes("T") &&
          !startStr.endsWith("T00:00:00") &&
          startStr.split("T")[1] !== "00:00:00";

        return {
          id: event.id,
          title: `${platformEmoji} ${contentTypeEmoji} ${
            event.title || "Başlıksız İçerik"
          }`,
          start: startStr,
          allDay: !hasTime,
          backgroundColor: "transparent",
          borderColor: "transparent",
          extendedProps: event,
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Takvim seti yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const loadAllContents = async () => {
    try {
      const contents = await socialMediaService.getAllGeneratedContents();
      setAllContents(contents || []);
    } catch (error) {
      console.error("Load contents error:", error);
    }
  };

  const handleUpdateSet = async () => {
    if (!editForm.name.trim()) {
      toast.error("Lütfen takvim seti adı girin");
      return;
    }

    try {
      const updatedSet = {
        ...calendarSet,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);
      setShowEditDialog(false);
      toast.success("Takvim seti güncellendi");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Güncelleme başarısız");
    }
  };

  const handleAddContentToCalendar = async (contentId) => {
    try {
      const content = allContents.find((c) => c.id === contentId);
      if (!content) return;

      const newEvent = {
        id: content.id,
        title: content.title,
        start: content.scheduledDate || new Date().toISOString(),
        platform: content.platform,
        contentType: content.contentType,
        status: content.status,
        ...content,
      };

      const updatedEvents = [...(calendarSet.events || []), newEvent];
      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);

      // Update content's usedInCalendars array
      const usedInCalendars = content.usedInCalendars || [];
      const usageInfo = {
        calendarId: params.id,
        calendarName: calendarSet.name,
        date: newEvent.start,
        addedAt: new Date().toISOString(),
      };

      const existingIndex = usedInCalendars.findIndex(
        (u) => u.calendarId === params.id
      );

      let updatedUsedInCalendars;
      if (existingIndex >= 0) {
        updatedUsedInCalendars = [...usedInCalendars];
        updatedUsedInCalendars[existingIndex] = usageInfo;
      } else {
        updatedUsedInCalendars = [...usedInCalendars, usageInfo];
      }

      await socialMediaService.updateGeneratedContent(contentId, {
        usedInCalendars: updatedUsedInCalendars,
      });

      setAllContents((prev) =>
        prev.map((c) =>
          c.id === contentId
            ? { ...c, usedInCalendars: updatedUsedInCalendars }
            : c
        )
      );

      // Update calendar view
      const platformData = PLATFORMS.find((p) => p.value === newEvent.platform);
      const platformEmoji =
        {
          instagram: "📷",
          facebook: "📘",
          x: "🐦",
          linkedin: "💼",
        }[newEvent.platform] || "📱";

      const contentTypeEmoji =
        CONTENT_TYPE_EMOJIS[newEvent.contentType] || "📝";

      // Check if event has time or is all-day
      const startStr = newEvent.start;
      const hasTime =
        startStr &&
        startStr.includes("T") &&
        !startStr.endsWith("T00:00:00") &&
        startStr.split("T")[1] !== "00:00:00";

      const calendarEvent = {
        id: newEvent.id,
        title: `${platformEmoji} ${contentTypeEmoji} ${
          newEvent.title || "Başlıksız İçerik"
        }`,
        start: startStr,
        allDay: !hasTime,
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: newEvent,
      };

      setEvents([...events, calendarEvent]);
      setShowAddContent(false);
      toast.success("İçerik takvime eklendi");
    } catch (error) {
      console.error("Add content error:", error);
      toast.error("İçerik eklenemedi");
    }
  };

  const handleRemoveFromCalendar = async (eventId) => {
    if (!confirm("Bu içeriği takvimden çıkarmak istediğinizden emin misiniz?"))
      return;

    try {
      const updatedEvents = (calendarSet.events || []).filter(
        (e) => e.id !== eventId
      );
      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);
      setEvents(events.filter((e) => e.id !== eventId));
      setShowPreview(false);

      // Update content's usedInCalendars array - remove this calendar
      const content = allContents.find((c) => c.id === eventId);
      if (content) {
        const updatedUsedInCalendars = (content.usedInCalendars || []).filter(
          (u) => u.calendarId !== params.id
        );

        await socialMediaService.updateGeneratedContent(eventId, {
          usedInCalendars: updatedUsedInCalendars,
        });

        // Update local state
        setAllContents((prev) =>
          prev.map((c) =>
            c.id === eventId
              ? { ...c, usedInCalendars: updatedUsedInCalendars }
              : c
          )
        );
      }

      toast.success("İçerik takvimden çıkarıldı");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("İçerik çıkarılamadı");
    }
  };

  const handleEventClick = (clickInfo) => {
    const eventData = clickInfo.event.extendedProps;
    const eventDate = clickInfo.event.startStr.split("T")[0];
    setSelectedDate(eventDate);
    setShowDayEditor(true);
  };

  const handleEventDrop = async (info) => {
    try {
      const eventId = info.event.id;
      const newDate = info.event.start.toISOString();

      const updatedEvents = (calendarSet.events || []).map((e) =>
        e.id === eventId ? { ...e, start: newDate, scheduledDate: newDate } : e
      );

      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);
      toast.success("İçerik tarihi güncellendi");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Tarih güncellenemedi");
      info.revert();
    }
  };

  const handleDateSelect = (selectInfo) => {
    const scheduledDate = selectInfo.startStr;
    setSelectedDate(scheduledDate);
    setShowDayEditor(true);
  };

  const handleAddContentToDay = async (date, contentId) => {
    try {
      const content = allContents.find((c) => c.id === contentId);
      if (!content) return;

      const newEvent = {
        id: content.id,
        title: content.title,
        start: date,
        platform: content.platform,
        contentType: content.contentType,
        status: content.status,
        scheduledDate: date,
        ...content,
      };

      const updatedEvents = [...(calendarSet.events || []), newEvent];
      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);

      // Update content's usedInCalendars array
      const usedInCalendars = content.usedInCalendars || [];
      const usageInfo = {
        calendarId: params.id,
        calendarName: calendarSet.name,
        date: date,
        addedAt: new Date().toISOString(),
      };

      // Check if already exists in this calendar
      const existingIndex = usedInCalendars.findIndex(
        (u) => u.calendarId === params.id
      );

      let updatedUsedInCalendars;
      if (existingIndex >= 0) {
        // Update existing entry
        updatedUsedInCalendars = [...usedInCalendars];
        updatedUsedInCalendars[existingIndex] = usageInfo;
      } else {
        // Add new entry
        updatedUsedInCalendars = [...usedInCalendars, usageInfo];
      }

      await socialMediaService.updateGeneratedContent(contentId, {
        usedInCalendars: updatedUsedInCalendars,
      });

      // Update local state
      setAllContents((prev) =>
        prev.map((c) =>
          c.id === contentId
            ? { ...c, usedInCalendars: updatedUsedInCalendars }
            : c
        )
      );

      // Update calendar view
      const platformData = PLATFORMS.find((p) => p.value === newEvent.platform);
      const platformEmoji =
        {
          instagram: "📷",
          facebook: "📘",
          x: "🐦",
          linkedin: "💼",
        }[newEvent.platform] || "📱";

      const contentTypeEmoji =
        CONTENT_TYPE_EMOJIS[newEvent.contentType] || "📝";

      // Check if event has time or is all-day
      const startStr = newEvent.start;
      const hasTime =
        startStr &&
        startStr.includes("T") &&
        !startStr.endsWith("T00:00:00") &&
        startStr.split("T")[1] !== "00:00:00";

      const calendarEvent = {
        id: newEvent.id,
        title: `${platformEmoji} ${contentTypeEmoji} ${
          newEvent.title || "Başlıksız İçerik"
        }`,
        start: startStr,
        allDay: !hasTime,
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: newEvent,
      };

      setEvents([...events, calendarEvent]);
    } catch (error) {
      console.error("Add content error:", error);
      throw error;
    }
  };

  const handleRemoveContentFromDay = async (date, contentId) => {
    try {
      const updatedEvents = (calendarSet.events || []).filter(
        (e) => e.id !== contentId
      );
      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);
      setEvents(events.filter((e) => e.id !== contentId));

      // Update content's usedInCalendars array - remove this calendar
      const content = allContents.find((c) => c.id === contentId);
      if (content) {
        const updatedUsedInCalendars = (content.usedInCalendars || []).filter(
          (u) => u.calendarId !== params.id
        );

        await socialMediaService.updateGeneratedContent(contentId, {
          usedInCalendars: updatedUsedInCalendars,
        });

        // Update local state
        setAllContents((prev) =>
          prev.map((c) =>
            c.id === contentId
              ? { ...c, usedInCalendars: updatedUsedInCalendars }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Remove error:", error);
      throw error;
    }
  };

  const handleClearDay = async (date, dayContents) => {
    try {
      // Get content IDs for this day
      const contentIds = dayContents.map((c) => c.id);

      // Remove all events for this day
      const updatedEvents = (calendarSet.events || []).filter(
        (e) => !contentIds.includes(e.id)
      );

      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);
      setEvents(events.filter((e) => !contentIds.includes(e.id)));

      // Update usedInCalendars for all affected contents
      for (const contentId of contentIds) {
        const content = allContents.find((c) => c.id === contentId);
        if (content) {
          const updatedUsedInCalendars = (content.usedInCalendars || []).filter(
            (u) => u.calendarId !== params.id
          );

          await socialMediaService.updateGeneratedContent(contentId, {
            usedInCalendars: updatedUsedInCalendars,
          });

          // Update local state
          setAllContents((prev) =>
            prev.map((c) =>
              c.id === contentId
                ? { ...c, usedInCalendars: updatedUsedInCalendars }
                : c
            )
          );
        }
      }
    } catch (error) {
      console.error("Clear day error:", error);
      throw error;
    }
  };

  const handleUpdateDayStatus = async (date, status) => {
    try {
      // Find events for this day and update their metadata
      const updatedEvents = (calendarSet.events || []).map((event) => {
        const eventDate = new Date(event.start || event.scheduledDate)
          .toISOString()
          .split("T")[0];
        const targetDate = new Date(date).toISOString().split("T")[0];

        if (eventDate === targetDate) {
          return {
            ...event,
            dayMetadata: {
              ...(event.dayMetadata || {}),
              status,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return event;
      });

      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);

      // Update events display
      const updatedCalendarEvents = updatedEvents.map((event) => {
        const platformData = PLATFORMS.find((p) => p.value === event.platform);
        const platformEmoji =
          {
            instagram: "📷",
            facebook: "📘",
            x: "🐦",
            linkedin: "💼",
          }[event.platform] || "📱";

        const contentTypeEmoji = CONTENT_TYPE_EMOJIS[event.contentType] || "📝";

        // Check if event has time or is all-day
        const startStr = event.start || event.scheduledDate;
        const hasTime =
          startStr &&
          startStr.includes("T") &&
          !startStr.endsWith("T00:00:00") &&
          startStr.split("T")[1] !== "00:00:00";

        return {
          id: event.id,
          title: `${platformEmoji} ${contentTypeEmoji} ${
            event.title || "Başlıksız İçerik"
          }`,
          start: startStr,
          allDay: !hasTime,
          backgroundColor: "transparent",
          borderColor: "transparent",
          extendedProps: event,
        };
      });
      setEvents(updatedCalendarEvents);
    } catch (error) {
      console.error("Update day status error:", error);
      throw error;
    }
  };

  const handleUpdateDayNotes = async (date, notes) => {
    try {
      // Find events for this day and update their metadata
      const updatedEvents = (calendarSet.events || []).map((event) => {
        const eventDate = new Date(event.start || event.scheduledDate)
          .toISOString()
          .split("T")[0];
        const targetDate = new Date(date).toISOString().split("T")[0];

        if (eventDate === targetDate) {
          return {
            ...event,
            dayMetadata: {
              ...(event.dayMetadata || {}),
              notes,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return event;
      });

      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);
    } catch (error) {
      console.error("Update day notes error:", error);
      throw error;
    }
  };

  const handleCreateNewContentForDay = (date, existingContentId = null) => {
    if (existingContentId) {
      sessionStorage.setItem(
        "editingContent",
        JSON.stringify(
          calendarSet.events.find((e) => e.id === existingContentId)
        )
      );
    } else {
      sessionStorage.setItem("scheduledDate", date);
      sessionStorage.setItem("returnToCalendarSet", params.id);
    }
    router.push("/admin/social-media/content-studio");
  };

  const handleUpdateContentTime = async (date, contentId, time) => {
    try {
      const updatedEvents = (calendarSet.events || []).map((event) => {
        if (event.id === contentId) {
          // Get the target date (either from event or selected date)
          const eventDateStr = event.scheduledDate || event.start || date;

          // Extract just the date part (YYYY-MM-DD) to preserve the day
          let targetDate;
          if (typeof eventDateStr === "string") {
            if (eventDateStr.includes("T")) {
              targetDate = eventDateStr.split("T")[0];
            } else if (eventDateStr.length === 10) {
              targetDate = eventDateStr;
            } else {
              targetDate = new Date(eventDateStr).toISOString().split("T")[0];
            }
          } else {
            targetDate = new Date(date).toISOString().split("T")[0];
          }

          // Create new date-time string in ISO format: YYYY-MM-DDTHH:MM:SS
          const newScheduledDate = `${targetDate}T${time}:00`;

          return {
            ...event,
            scheduledTime: time, // Keep legacy field for compatibility
            scheduledDate: newScheduledDate, // Store as local date-time (no timezone)
            start: newScheduledDate, // Update start field too
            updatedAt: new Date().toISOString(),
          };
        }
        return event;
      });

      const updatedSet = {
        ...calendarSet,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      await socialMediaService.updateCalendarPlan(params.id, updatedSet);
      setCalendarSet(updatedSet);

      // Update events display
      const updatedCalendarEvents = updatedEvents.map((event) => {
        const platformData = PLATFORMS.find((p) => p.value === event.platform);
        const platformEmoji =
          {
            instagram: "📷",
            facebook: "📘",
            x: "🐦",
            linkedin: "💼",
          }[event.platform] || "📱";

        const contentTypeEmoji = CONTENT_TYPE_EMOJIS[event.contentType] || "📝";

        // Check if event has time or is all-day
        const startStr = event.start || event.scheduledDate;
        const hasTime =
          startStr &&
          startStr.includes("T") &&
          !startStr.endsWith("T00:00:00") &&
          startStr.split("T")[1] !== "00:00:00";

        return {
          id: event.id,
          title: `${platformEmoji} ${contentTypeEmoji} ${
            event.title || "Başlıksız İçerik"
          }`,
          start: startStr,
          allDay: !hasTime,
          backgroundColor: "transparent",
          borderColor: "transparent",
          extendedProps: event,
        };
      });
      setEvents(updatedCalendarEvents);
    } catch (error) {
      console.error("Update time error:", error);
      throw error;
    }
  };

  const exportCalendar = () => {
    const dataStr = JSON.stringify(calendarSet, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calendar-${calendarSet.name}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    toast.success("Takvim dışa aktarıldı");
  };

  const filteredEvents =
    filterPlatform === "all"
      ? events
      : events.filter((e) => e.extendedProps?.platform === filterPlatform);

  const platformStats = PLATFORMS.map((platform) => ({
    ...platform,
    count: events.filter((e) => e.extendedProps?.platform === platform.value)
      .length,
  }));

  const availableContents = allContents.filter(
    (c) => !events.find((e) => e.id === c.id)
  );

  // Get contents for selected date
  const getDayContents = (date) => {
    if (!date) return [];

    // Normalize the target date to YYYY-MM-DD format
    const targetDate = new Date(date).toISOString().split("T")[0];

    const dayEvents = (calendarSet.events || []).filter((event) => {
      // If event has no date, skip it
      if (!event.start && !event.scheduledDate) {
        return false;
      }

      try {
        const eventDateStr = event.start || event.scheduledDate;

        // If it's just a date string without time (YYYY-MM-DD), use it directly
        if (eventDateStr.length === 10 && !eventDateStr.includes("T")) {
          return eventDateStr === targetDate;
        }

        // If it's an ISO string with time, extract the date part BEFORE converting to UTC
        // This preserves the local date regardless of timezone
        if (eventDateStr.includes("T")) {
          const localDate = eventDateStr.split("T")[0];
          return localDate === targetDate;
        }

        // Fallback: try to parse as Date object
        const eventDateObj = new Date(eventDateStr);
        if (isNaN(eventDateObj.getTime())) {
          return false;
        }

        const eventDate = eventDateObj.toISOString().split("T")[0];
        return eventDate === targetDate;
      } catch (error) {
        return false;
      }
    });

    return dayEvents;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <CalendarIcon className="w-24 h-24 mx-auto text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Takvim Yükleniyor
            </h3>
            <p className="text-sm text-gray-600">İçerikler hazırlanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!calendarSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <CalendarIcon className="w-24 h-24 mx-auto text-gray-300" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              Takvim Bulunamadı
            </h3>
            <p className="text-sm text-gray-600">
              Bu takvim seti mevcut değil veya silinmiş olabilir
            </p>
            <Button
              onClick={() => router.push("/admin/social-media/calendar-view")}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Takvimlere Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="social_media.read">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Modern Header with Glassmorphism */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="rounded-xl hover:bg-white/50 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 shadow-xl">
                        <CalendarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                        {calendarSet.name}
                      </h1>
                      {calendarSet.description && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {calendarSet.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {hasPermission("social_media.edit") && (
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(true)}
                    className="rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={exportCalendar}
                  className="rounded-xl border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
                </Button>
                {hasPermission("social_media.create") && (
                  <Button
                    onClick={() => setShowAddContent(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İçerik Ekle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Modern Stats Cards with Gradient */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Total Events Card */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0 backdrop-blur-sm"
                  >
                    TOPLAM
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight">
                    {events.length}
                  </div>
                  <div className="text-sm opacity-90 font-medium">
                    Planlı İçerik
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <CalendarIcon className="h-32 w-32" />
              </div>
            </div>

            {/* Platform Stats Cards */}
            {platformStats.map((platform, index) => {
              const Icon = platform.icon;
              const gradients = [
                "from-pink-500 to-rose-500",
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-violet-500",
                "from-sky-500 to-blue-600",
              ];

              return (
                <div
                  key={platform.value}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 bg-gradient-to-br ${gradients[index]} rounded-xl shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {platform.label.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {platform.count}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        İçerik
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="h-24 w-24" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modern Controls Card */}
          <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={filterPlatform}
                    onValueChange={setFilterPlatform}
                  >
                    <SelectTrigger className="w-[220px] rounded-xl border-gray-200 bg-white hover:border-blue-300 transition-colors">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Platform Seç" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">
                        <div className="flex items-center gap-2 font-medium">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                          Tüm Platformlar
                        </div>
                      </SelectItem>
                      {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <SelectItem
                            key={platform.value}
                            value={platform.value}
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className="w-4 h-4"
                                style={{ color: platform.color }}
                              />
                              <span>{platform.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 rounded-lg border-gray-200 bg-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                    {filteredEvents.length} İçerik
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "calendar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                    className={`rounded-xl transition-all duration-200 ${
                      viewMode === "calendar"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Takvim
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-xl transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Liste
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-xl transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Grid
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          {viewMode === "calendar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card
                className={`border-0 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm ${
                  showPreview && selectedEvent
                    ? "lg:col-span-2"
                    : "lg:col-span-3"
                }`}
              >
                <CardContent className="p-8">
                  {!calendarPlugins ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                          <CalendarIcon className="relative w-16 h-16 mx-auto text-blue-600 animate-pulse" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Takvim yükleniyor...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="fullcalendar-wrapper">
                      <FullCalendar
                        plugins={calendarPlugins}
                        initialView="dayGridMonth"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        events={filteredEvents}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        locale="tr"
                        buttonText={{
                          today: "Bugün",
                          month: "Ay",
                          week: "Hafta",
                          day: "Gün",
                        }}
                        displayEventTime={true}
                        eventTimeFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          meridiem: false,
                          hour12: false,
                        }}
                        height="auto"
                        eventContent={(arg) => {
                          const event = arg.event;
                          const platform = event.extendedProps?.platform;
                          const contentType = event.extendedProps?.contentType;
                          const hasTime =
                            arg.event.startStr &&
                            arg.event.startStr.includes("T") &&
                            arg.event.startStr.split("T")[1] !== "00:00:00";

                          // Get platform data
                          const platformData = PLATFORMS.find(
                            (p) => p.value === platform
                          );
                          const PlatformIcon = platformData?.icon;

                          // Content type emoji
                          const contentEmoji =
                            CONTENT_TYPE_EMOJIS[contentType] || "📝";

                          // Get title without icons
                          const titleParts = event.title.split(" ");
                          const cleanTitle =
                            titleParts.slice(2).join(" ") || event.title;

                          return (
                            <div
                              className="event-card-modern"
                              style={{
                                background: hasTime
                                  ? `linear-gradient(135deg, ${
                                      platformData?.color || "#718096"
                                    } 0%, ${
                                      platformData?.darkColor || "#4A5568"
                                    } 100%)`
                                  : "linear-gradient(135deg, #E2E8F0 0%, #CBD5E0 100%)",
                              }}
                            >
                              <div className="flex items-center gap-2 p-2.5">
                                {/* Platform Icon Badge */}
                                {PlatformIcon && (
                                  <div
                                    className="platform-icon-badge flex-shrink-0"
                                    style={{
                                      background: hasTime
                                        ? "rgba(255, 255, 255, 0.25)"
                                        : "rgba(255, 255, 255, 0.8)",
                                    }}
                                  >
                                    <PlatformIcon
                                      className="w-3.5 h-3.5"
                                      style={{
                                        color: hasTime
                                          ? "white"
                                          : platformData?.color || "#718096",
                                        strokeWidth: 2.5,
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Content Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px]">
                                      {contentEmoji}
                                    </span>
                                    <span
                                      className="event-title-text text-[11px] font-semibold leading-tight truncate"
                                      style={{
                                        color: hasTime ? "white" : "#2D3748",
                                      }}
                                    >
                                      {cleanTitle}
                                    </span>
                                  </div>

                                  {/* Time badge */}
                                  {hasTime && arg.timeText && (
                                    <div
                                      className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                                      style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(8px)",
                                        color: "white",
                                      }}
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>{arg.timeText}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Modern Preview Panel */}
              {showPreview && selectedEvent && (
                <Card className="lg:col-span-1 border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Önizleme
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          {PLATFORMS.find(
                            (p) => p.value === selectedEvent.platform
                          )?.icon &&
                            (() => {
                              const Icon = PLATFORMS.find(
                                (p) => p.value === selectedEvent.platform
                              )?.icon;
                              return (
                                <Icon
                                  className="w-4 h-4"
                                  style={{
                                    color: PLATFORMS.find(
                                      (p) => p.value === selectedEvent.platform
                                    )?.color,
                                  }}
                                />
                              );
                            })()}
                          <span className="capitalize font-medium">
                            {selectedEvent.platform}
                          </span>
                          <span className="text-xs">•</span>
                          <Badge
                            variant="secondary"
                            className="capitalize text-xs"
                          >
                            {CONTENT_TYPE_EMOJIS[selectedEvent.contentType]}{" "}
                            {selectedEvent.contentType}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPreview(false)}
                        className="rounded-xl hover:bg-red-50 hover:text-red-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative">
                        <MobilePreview
                          platform={selectedEvent.platform || "instagram"}
                          contentType={selectedEvent.contentType || "post"}
                          content={{
                            title: selectedEvent.title,
                            caption:
                              selectedEvent.content?.caption ||
                              selectedEvent.title,
                            text:
                              selectedEvent.content?.text ||
                              selectedEvent.title,
                            image: selectedEvent.image,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Durum
                        </span>
                        <Badge
                          variant={
                            selectedEvent.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className="rounded-lg"
                        >
                          {selectedEvent.status === "published"
                            ? "✓ Yayınlandı"
                            : "📝 Taslak"}
                        </Badge>
                      </div>

                      {selectedEvent.scheduledDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Tarih
                          </span>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Clock className="w-4 h-4 text-blue-600" />
                            {new Date(
                              selectedEvent.scheduledDate || selectedEvent.start
                            ).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => {
                            sessionStorage.setItem(
                              "editingContent",
                              JSON.stringify(selectedEvent)
                            );
                            router.push("/admin/social-media/content-studio");
                          }}
                        >
                          <Edit2 className="w-3 h-3 mr-1.5" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          onClick={() =>
                            handleRemoveFromCalendar(selectedEvent.id)
                          }
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : viewMode === "list" ? (
            // List View
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-3">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                        <CalendarIcon className="relative w-20 h-20 mx-auto text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Henüz içerik yok
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Bu takvimde henüz planlı içerik bulunmuyor
                      </p>
                      <Button
                        onClick={() => setShowAddContent(true)}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        İlk İçeriği Ekle
                      </Button>
                    </div>
                  ) : (
                    filteredEvents.map((event, index) => {
                      const platform = PLATFORMS.find(
                        (p) => p.value === event.extendedProps?.platform
                      );
                      const Icon = platform?.icon;

                      return (
                        <div
                          key={event.id}
                          className="group flex items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:border-blue-200 cursor-pointer transition-all duration-200 hover:shadow-lg"
                          onClick={() => {
                            setSelectedEvent(event.extendedProps);
                            setShowPreview(true);
                            setViewMode("calendar");
                          }}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: "fadeInUp 0.5s ease-out forwards",
                          }}
                        >
                          <div
                            className="relative w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200"
                            style={{
                              background: `linear-gradient(135deg, ${platform?.color} 0%, ${platform?.color}dd 100%)`,
                            }}
                          >
                            {Icon && <Icon className="w-7 h-7" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-3 mt-1.5">
                              <Badge
                                variant="outline"
                                className="rounded-lg capitalize"
                              >
                                {
                                  CONTENT_TYPE_EMOJIS[
                                    event.extendedProps?.contentType
                                  ]
                                }{" "}
                                {event.extendedProps?.contentType}
                              </Badge>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(event.start).toLocaleDateString(
                                  "tr-TR",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              event.extendedProps?.status === "published"
                                ? "default"
                                : "secondary"
                            }
                            className="rounded-lg"
                          >
                            {event.extendedProps?.status === "published"
                              ? "✓ Yayında"
                              : "📝 Taslak"}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                    <Grid3x3 className="relative w-20 h-20 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Henüz içerik yok
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Bu takvimde henüz planlı içerik bulunmuyor
                  </p>
                  <Button
                    onClick={() => setShowAddContent(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    İlk İçeriği Ekle
                  </Button>
                </div>
              ) : (
                filteredEvents.map((event, index) => {
                  const platform = PLATFORMS.find(
                    (p) => p.value === event.extendedProps?.platform
                  );
                  const Icon = platform?.icon;

                  return (
                    <Card
                      key={event.id}
                      className="group border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white"
                      onClick={() => {
                        setSelectedEvent(event.extendedProps);
                        setShowPreview(true);
                        setViewMode("calendar");
                      }}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "fadeInUp 0.5s ease-out forwards",
                      }}
                    >
                      <div
                        className="h-32 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${platform?.color} 0%, ${platform?.color}dd 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                        <div className="relative h-full flex items-center justify-center">
                          {Icon && <Icon className="w-16 h-16 text-white/90" />}
                        </div>
                        <Badge
                          variant="secondary"
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm"
                        >
                          {event.extendedProps?.status === "published"
                            ? "✓ Yayında"
                            : "📝 Taslak"}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="rounded-lg capitalize text-xs"
                            >
                              {
                                CONTENT_TYPE_EMOJIS[
                                  event.extendedProps?.contentType
                                ]
                              }{" "}
                              {event.extendedProps?.contentType}
                            </Badge>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.start).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modern Add Content Dialog */}
        <Dialog open={showAddContent} onOpenChange={setShowAddContent}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border-0 shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Takvime İçerik Ekle
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Mevcut içeriklerden seçim yapın ve takvime ekleyin
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(85vh-150px)] pr-2">
              <div className="space-y-3 py-4">
                {availableContents.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                      <FileText className="relative w-20 h-20 mx-auto text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Eklenebilecek içerik yok
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Tüm içerikler zaten takvimde veya henüz içerik
                      oluşturulmamış
                    </p>
                    <Button
                      onClick={() =>
                        router.push("/admin/social-media/content-studio")
                      }
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Yeni İçerik Oluştur
                    </Button>
                  </div>
                ) : (
                  availableContents.map((content, index) => {
                    const platform = PLATFORMS.find(
                      (p) => p.value === content.platform
                    );
                    const Icon = platform?.icon;

                    return (
                      <div
                        key={content.id}
                        className="group flex items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:border-blue-200 cursor-pointer transition-all duration-200 hover:shadow-lg"
                        onClick={() => handleAddContentToCalendar(content.id)}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: "fadeInUp 0.5s ease-out forwards",
                        }}
                      >
                        <div
                          className="relative w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200"
                          style={{
                            background: `linear-gradient(135deg, ${platform?.color} 0%, ${platform?.color}dd 100%)`,
                          }}
                        >
                          {Icon && <Icon className="w-7 h-7" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {content.title || "Başlıksız İçerik"}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-3 mt-1.5">
                            <Badge
                              variant="outline"
                              className="rounded-lg capitalize"
                            >
                              {CONTENT_TYPE_EMOJIS[content.contentType]}{" "}
                              {content.contentType}
                            </Badge>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(content.createdAt).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ekle
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modern Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Takvim Setini Düzenle
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Takvim seti bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Takvim Seti Adı
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Takvim seti adı"
                  className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-semibold text-gray-700"
                >
                  Açıklama
                </Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Açıklama (opsiyonel)"
                  rows={3}
                  className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  İptal
                </Button>
                <Button
                  onClick={handleUpdateSet}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Global Animations */}
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          /* FullCalendar Custom Styles - Modern Minimalist */
          .fc {
            font-family: inherit;
          }

          /* Modern Minimalist Buttons */
          .fc .fc-button,
          .fc .fc-button-primary {
            background: white !important;
            border: 1.5px solid #e5e7eb !important;
            color: #1f2937 !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.625rem !important;
            font-size: 0.875rem !important;
            text-transform: none !important;
            font-weight: 500 !important;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
            transition: all 0.15s ease !important;
          }

          .fc .fc-button:hover,
          .fc .fc-button-primary:hover {
            background: #f9fafb !important;
            border-color: #d1d5db !important;
            color: #111827 !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
          }

          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background: #3b82f6 !important;
            border-color: #3b82f6 !important;
            color: white !important;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
          }

          .fc .fc-button:focus {
            outline: none !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          }

          .fc .fc-button:disabled {
            background: #f9fafb !important;
            border-color: #e5e7eb !important;
            color: #d1d5db !important;
            opacity: 0.6 !important;
            cursor: not-allowed !important;
          }

          /* Toolbar Title - Minimalist */
          .fc .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            color: #111827 !important;
            letter-spacing: -0.025em !important;
          }

          /* Calendar Grid - Minimalist */
          .fc-theme-standard td,
          .fc-theme-standard th {
            border-color: #f3f4f6 !important;
          }
          .fc-theme-standard .fc-scrollgrid {
            border-color: #e5e7eb !important;
            border-radius: 0.75rem !important;
            overflow: hidden !important;
          }

          /* Today's Date - Subtle Highlight */
          .fc .fc-daygrid-day.fc-day-today {
            background: #eff6ff !important;
          }
          .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
            background: #3b82f6 !important;
            color: white !important;
            font-weight: 600 !important;
            width: 28px !important;
            height: 28px !important;
            border-radius: 0.5rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0.25rem !important;
          }

          /* Events - Modern Soft Cards */
          .fc-event {
            cursor: pointer !important;
            border-radius: 8px !important;
            padding: 0 !important;
            border: none !important;
            font-weight: 500 !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08),
              0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            overflow: hidden !important;
          }

          /* Modern Event Card Container */
          .event-card-modern {
            width: 100%;
            height: 100%;
            position: relative;
            border-radius: 8px;
          }

          /* Platform Icon Badge */
          .event-card-modern .platform-icon-badge {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            backdrop-filter: blur(8px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          /* Event Title Text */
          .event-card-modern .event-title-text {
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            font-weight: 600;
            letter-spacing: -0.01em;
          }

          /* Hover State - Subtle lift */
          .fc-event:hover {
            transform: translateY(-2px) scale(1.01) !important;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12),
              0 2px 4px 0 rgba(0, 0, 0, 0.06) !important;
          }

          /* Active State */
          .fc-event:active {
            transform: translateY(-1px) scale(0.99) !important;
          }

          /* Remove FullCalendar default background override */
          .fc-event.fc-daygrid-event,
          .fc-event.fc-timegrid-event {
            background: none !important;
            border: none !important;
          }

          /* Column Headers - Clean Typography */
          .fc .fc-col-header-cell-cushion {
            padding: 0.625rem 0.5rem !important;
            font-weight: 600 !important;
            color: #6b7280 !important;
            text-transform: uppercase !important;
            font-size: 0.6875rem !important;
            letter-spacing: 0.05em !important;
          }

          /* Day Numbers - Minimalist */
          .fc .fc-daygrid-day-number {
            padding: 0.5rem !important;
            color: #374151 !important;
            font-weight: 500 !important;
            transition: all 0.15s ease !important;
            font-size: 0.875rem !important;
          }
          .fc .fc-daygrid-day:hover .fc-daygrid-day-number {
            color: #3b82f6 !important;
          }

          /* Day Cell Hover Effect - Yellow/Amber Highlight */
          .fc .fc-daygrid-day {
            border-color: #f3f4f6 !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
          }

          .fc .fc-daygrid-day:hover {
            background: linear-gradient(
              135deg,
              #fef3c7 0%,
              #fde68a 100%
            ) !important;
            border-color: #fbbf24 !important;
            box-shadow: 0 0 0 1px #fbbf24 inset !important;
          }

          .fc .fc-daygrid-day.fc-day-today:hover {
            background: linear-gradient(
              135deg,
              #dbeafe 0%,
              #bfdbfe 100%
            ) !important;
            border-color: #3b82f6 !important;
          }

          /* Day Frame - Consistent Height */
          .fc .fc-daygrid-day-frame {
            min-height: 100px !important;
          }

          /* Grid Sections - Clean Borders */
          .fc .fc-scrollgrid-section > * {
            border-color: #f3f4f6 !important;
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 100px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 100px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
          }
        `}</style>

        {/* Day Editor Panel */}
        <DayEditorPanel
          open={showDayEditor}
          onOpenChange={setShowDayEditor}
          selectedDate={selectedDate}
          dayContents={getDayContents(selectedDate)}
          availableContents={availableContents}
          onAddContent={handleAddContentToDay}
          onRemoveContent={handleRemoveContentFromDay}
          onUpdateDayStatus={handleUpdateDayStatus}
          onUpdateDayNotes={handleUpdateDayNotes}
          onCreateNewContent={handleCreateNewContentForDay}
          onUpdateContentTime={handleUpdateContentTime}
          onClearDay={handleClearDay}
        />
      </div>
    </PermissionGuard>
  );
}
