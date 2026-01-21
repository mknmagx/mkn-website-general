"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// Icons
import {
  Mail,
  MailOpen,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Reply,
  Sparkles,
  User,
  Building2,
  Paperclip,
} from "lucide-react";

/**
 * Conversation durumuna göre renk ve ikon
 */
const getStatusConfig = (status) => {
  const configs = {
    new: {
      label: "Yeni",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: AlertCircle,
      dotColor: "bg-blue-500",
    },
    needs_reply: {
      label: "Yanıt Bekliyor",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: Reply,
      dotColor: "bg-red-500 animate-pulse",
    },
    waiting_reply: {
      label: "Müşteri Yanıtı Bekleniyor",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: Clock,
      dotColor: "bg-orange-500",
    },
    converted: {
      label: "Talebe Dönüştürüldü",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      dotColor: "bg-green-500",
    },
    replied: {
      label: "Yanıtlandı",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: MailOpen,
      dotColor: "bg-purple-500",
    },
  };
  return configs[status] || configs.new;
};

/**
 * E-posta Konuşma Kartı
 * Bir conversation'daki tüm e-postaları gösterir
 */
export default function ConversationCard({
  conversation,
  onConvert,
  onAiReply,
  onViewEmail,
  isExpanded = false,
}) {
  const [expanded, setExpanded] = useState(isExpanded);
  const statusConfig = getStatusConfig(conversation.status);
  const StatusIcon = statusConfig.icon;

  // Müşteri bilgisini al (MKN dışındaki ilk gönderen)
  const customerEmail = conversation.emails.find(
    (e) => e.from?.emailAddress?.address?.toLowerCase() !== "info@mkngroup.com.tr"
  );
  const customerInfo = {
    name: customerEmail?.from?.emailAddress?.name || "",
    email: customerEmail?.from?.emailAddress?.address || "",
  };

  // Son e-posta
  const lastEmail = conversation.emails[conversation.emails.length - 1];
  const isLastFromCustomer = lastEmail?.from?.emailAddress?.address?.toLowerCase() !== "info@mkngroup.com.tr";

  // Tarih formatlama
  const formatDate = (date) => {
    if (!date) return "";
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      conversation.unreadCount > 0 
        ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10" 
        : "hover:shadow-md"
    }`}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        {/* Header - Her zaman görünür */}
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Avatar / Status Icon */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  conversation.unreadCount > 0 
                    ? "bg-blue-100 dark:bg-blue-900/30" 
                    : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {conversation.unreadCount > 0 ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MailOpen className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {/* Okunmamış/Durum göstergesi */}
                {(conversation.unreadCount > 0 || conversation.status === "needs_reply") && (
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusConfig.dotColor}`} />
                )}
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                {/* Üst satır: İsim, Durum, Tarih */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium truncate ${
                    conversation.unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {customerInfo.name || customerInfo.email?.split("@")[0] || "Bilinmeyen"}
                  </span>
                  
                  {/* Mesaj sayısı badge */}
                  {conversation.totalCount > 1 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {conversation.totalCount}
                    </Badge>
                  )}

                  {/* Okunmamış sayısı */}
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0">
                      {conversation.unreadCount} yeni
                    </Badge>
                  )}

                  <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">
                    {formatDate(conversation.lastEmailDate)}
                  </span>
                </div>

                {/* Konu */}
                <p className={`text-sm truncate mb-1 ${
                  conversation.unreadCount > 0 ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                }`}>
                  {conversation.subject}
                </p>

                {/* Önizleme */}
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {isLastFromCustomer ? "" : "Siz: "}
                  {lastEmail?.bodyPreview?.substring(0, 100) || "İçerik yok"}
                </p>
              </div>

              {/* Expand/Collapse */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                {expanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="border-t dark:border-gray-700">
            {/* Aksiyonlar */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAiReply?.(conversation);
                }}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI ile Yanıt
              </Button>

              <div className="ml-auto text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {customerInfo.email}
                </span>
              </div>
            </div>

            {/* E-posta Listesi */}
            <div className="divide-y dark:divide-gray-700">
              {conversation.emails.map((email, index) => {
                const isFromMkn = email.from?.emailAddress?.address?.toLowerCase() === "info@mkngroup.com.tr";
                const isUnread = !email.isRead;
                
                return (
                  <div
                    key={email.id}
                    className={`p-4 ${isUnread ? "bg-blue-50/50 dark:bg-blue-900/20" : ""} ${
                      isFromMkn ? "bg-gray-50/50 dark:bg-gray-800/30" : ""
                    } hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors`}
                    onClick={() => onViewEmail?.(email, conversation)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Gönderen göstergesi */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        isFromMkn 
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" 
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {isFromMkn ? "MKN" : (email.from?.emailAddress?.name?.charAt(0) || "?")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm ${isUnread ? "font-semibold" : "font-medium"}`}>
                            {isFromMkn ? "MKN GROUP" : email.from?.emailAddress?.name || email.from?.emailAddress?.address}
                          </span>
                          {isFromMkn && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Giden
                            </Badge>
                          )}
                          {email.hasAttachments && (
                            <Paperclip className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatDate(email.receivedDateTime)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isUnread ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {email.bodyPreview?.substring(0, 150)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
