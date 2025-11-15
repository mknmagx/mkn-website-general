import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Calendar,
  User,
  ExternalLink,
  RotateCcw,
  Target,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TitleUsageTracker = ({
  titles = [],
  categoryKey,
  categoryName,
  datasetId,
  onTitleSelect,
  selectedTitle,
  showUsageDetails = true,
  compact = false,
  className,
}) => {
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedTitleData, setSelectedTitleData] = useState(null);

  const handleTitleClick = (titleData) => {
    if (onTitleSelect) {
      onTitleSelect(titleData);
    }
  };

  const handleShowUsageDetails = (titleData, event) => {
    event.stopPropagation();
    setSelectedTitleData(titleData);
    setShowUsageDialog(true);
  };

  const getTitleStatusIcon = (titleData) => {
    if (!titleData.isUsed) {
      return <Target className="h-4 w-4 text-green-500" />;
    }

    if (titleData.usageCount === 1) {
      return <CheckCircle className="h-4 w-4 text-orange-500" />;
    }

    return <RotateCcw className="h-4 w-4 text-red-500" />;
  };

  const getTitleStatusBadge = (titleData) => {
    if (!titleData.isUsed) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 text-xs"
        >
          <Target className="mr-1 h-3 w-3" />
          Kullanılabilir
        </Badge>
      );
    }

    if (titleData.usageCount === 1) {
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-orange-800 text-xs"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          {titleData.usageCount}x Kullanıldı
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
        <RotateCcw className="mr-1 h-3 w-3" />
        {titleData.usageCount}x Kullanıldı
      </Badge>
    );
  };

  const getTimeAgo = (date) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: tr,
      });
    } catch (error) {
      return "";
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {titles.map((titleData, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all",
              titleData.isUsed
                ? "bg-gray-50 border-gray-200"
                : "bg-green-50 border-green-200 hover:bg-green-100",
              selectedTitle === titleData.title && "ring-2 ring-blue-500"
            )}
            onClick={() => handleTitleClick(titleData)}
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {getTitleStatusIcon(titleData)}
              <span
                className={cn(
                  "text-sm truncate",
                  titleData.isUsed ? "text-gray-600" : "text-gray-900"
                )}
              >
                {titleData.title}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {getTitleStatusBadge(titleData)}
              {showUsageDetails && titleData.isUsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleShowUsageDetails(titleData, e)}
                  className="h-6 w-6 p-0"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {titles.map((titleData, index) => (
          <Card
            key={index}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              titleData.isUsed
                ? "border-gray-200 bg-gray-50"
                : "border-green-200 bg-green-50 hover:bg-green-100",
              selectedTitle === titleData.title && "ring-2 ring-blue-500"
            )}
            onClick={() => handleTitleClick(titleData)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTitleStatusIcon(titleData)}
                    <h3
                      className={cn(
                        "font-medium text-sm leading-relaxed",
                        titleData.isUsed ? "text-gray-700" : "text-gray-900"
                      )}
                    >
                      {titleData.title}
                    </h3>
                  </div>

                  {titleData.isUsed && titleData.lastUsedAt && (
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Son kullanım: {getTimeAgo(titleData.lastUsedAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {getTitleStatusBadge(titleData)}
                  {showUsageDetails && titleData.isUsed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleShowUsageDetails(titleData, e)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Kullanım detaylarını görüntüle</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {titles.length === 0 && (
          <Card className="border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz başlık bulunamadı
              </h3>
              <p className="text-gray-500">
                Bu kategori için henüz başlık eklenmemiş.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Details Dialog */}
      <AlertDialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span>Başlık Kullanım Detayları</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {selectedTitleData && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {selectedTitleData.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <Badge variant="outline">{categoryName}</Badge>
                        <span className="flex items-center space-x-1">
                          <RotateCcw className="h-3 w-3" />
                          <span>
                            {selectedTitleData.usageCount} kez kullanıldı
                          </span>
                        </span>
                        {selectedTitleData.lastUsedAt && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Son: {getTimeAgo(selectedTitleData.lastUsedAt)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedTitleData.usages &&
                      selectedTitleData.usages.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">
                            Kullanım Geçmişi ({selectedTitleData.usages.length})
                          </h5>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedTitleData.usages.map((usage, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Calendar className="h-3 w-3 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {format(
                                        new Date(usage.usedAt),
                                        "dd MMMM yyyy 'saat' HH:mm",
                                        { locale: tr }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    {usage.usedBy && (
                                      <span className="flex items-center space-x-1">
                                        <User className="h-3 w-3" />
                                        <span>{usage.usedBy}</span>
                                      </span>
                                    )}
                                    {usage.usageType && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {usage.usageType === "blog_generation"
                                          ? "AI Blog Üretimi"
                                          : "Manuel Seçim"}
                                      </Badge>
                                    )}
                                    {usage.aiModel && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {usage.aiModel}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {usage.blogSlug && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        `/blog/${usage.blogSlug}`,
                                        "_blank"
                                      )
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kapat</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default TitleUsageTracker;
