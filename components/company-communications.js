"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import {
  Phone,
  Mail,
  Video,
  Users,
  MessageSquare,
  FileText,
  Plus,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  ArrowRight,
  Bell,
  Edit,
  Trash2,
} from "lucide-react";
import {
  createCommunication,
  getCompanyCommunications,
  updateCommunication,
  deleteCommunication,
  getUpcomingTasks,
  getCompanyStats,
  COMMUNICATION_TYPES,
  COMMUNICATION_STATUS,
  TASK_PRIORITIES,
  getCommunicationTypeText,
  getPriorityText,
} from "../lib/services/company-communications";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function CompanyCommunications({ companyId, companyName }) {
  const { toast } = useToast();
  const [communications, setCommunications] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: COMMUNICATION_TYPES.PHONE_CALL,
    subject: "",
    content: "",
    scheduledDate: "",
    priority: TASK_PRIORITIES.MEDIUM,
    status: COMMUNICATION_STATUS.COMPLETED,
    attendees: "",
    outcome: "",
    nextAction: "",
    tags: "",
  });

  // Verileri yükle
  const loadData = async () => {
    try {
      setLoading(true);
      const [communicationsData, tasksData, statsData] = await Promise.all([
        getCompanyCommunications(companyId).catch(() => []),
        getUpcomingTasks(companyId).catch(() => []),
        getCompanyStats(companyId).catch(() => ({ 
          totalCommunications: 0, 
          lastContact: null,
          communicationsByType: {},
          monthlyActivity: {},
          averageResponseTime: 0
        })),
      ]);

      setCommunications(communicationsData || []);
      setUpcomingTasks(tasksData || []);
      setStats(statsData || {});
    } catch (error) {
      toast({
        title: "Hata",
        description: "İletişim verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
      setCommunications([]);
      setUpcomingTasks([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const communicationData = {
        companyId,
        companyName,
        ...formData,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [],
      };

      if (editingCommunication) {
        await updateCommunication(editingCommunication.id, communicationData);
      } else {
        await createCommunication(communicationData);
      }

      // Form'u sıfırla
      setFormData({
        type: COMMUNICATION_TYPES.PHONE_CALL,
        subject: "",
        content: "",
        scheduledDate: "",
        priority: TASK_PRIORITIES.MEDIUM,
        status: COMMUNICATION_STATUS.COMPLETED,
        attendees: "",
        outcome: "",
        nextAction: "",
        tags: "",
      });

      setIsAddDialogOpen(false);
      setEditingCommunication(null);
      
      toast({
        title: "Başarılı",
        description: "İletişim kaydı başarıyla kaydedildi.",
      });

      // Verileri yenile
      await loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İletişim kaydı kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // İletişim silme
  const confirmAndDelete = async (id) => {
    try {
      await deleteCommunication(id);
      toast({
        title: "Başarılı",
        description: "İletişim kaydı silindi.",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İletişim kaydı silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Düzenleme başlat
  const startEdit = (communication) => {
    setEditingCommunication(communication);
    setFormData({
      type: communication.type,
      subject: communication.subject || "",
      content: communication.content || "",
      scheduledDate: communication.scheduledDate ? format(new Date(communication.scheduledDate.toDate()), "yyyy-MM-dd'T'HH:mm") : "",
      priority: communication.priority || TASK_PRIORITIES.MEDIUM,
      status: communication.status || COMMUNICATION_STATUS.COMPLETED,
      attendees: communication.attendees || "",
      outcome: communication.outcome || "",
      nextAction: communication.nextAction || "",
      tags: communication.tags ? communication.tags.join(", ") : "",
    });
    setIsAddDialogOpen(true);
  };

  // İkon seçimi
  const getTypeIcon = (type) => {
    switch (type) {
      case COMMUNICATION_TYPES.PHONE_CALL:
        return <Phone className="h-4 w-4" />;
      case COMMUNICATION_TYPES.EMAIL:
        return <Mail className="h-4 w-4" />;
      case COMMUNICATION_TYPES.MEETING:
        return <Users className="h-4 w-4" />;
      case COMMUNICATION_TYPES.VIDEO_CALL:
        return <Video className="h-4 w-4" />;
      case COMMUNICATION_TYPES.WHATSAPP:
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Durum rengini al
  const getStatusColor = (status) => {
    switch (status) {
      case COMMUNICATION_STATUS.SCHEDULED:
        return "bg-blue-100 text-blue-800";
      case COMMUNICATION_STATUS.COMPLETED:
        return "bg-green-100 text-green-800";
      case COMMUNICATION_STATUS.CANCELLED:
        return "bg-red-100 text-red-800";
      case COMMUNICATION_STATUS.POSTPONED:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Öncelik rengini al
  const getPriorityColor = (priority) => {
    switch (priority) {
      case TASK_PRIORITIES.URGENT:
        return "bg-red-100 text-red-800";
      case TASK_PRIORITIES.HIGH:
        return "bg-orange-100 text-orange-800";
      case TASK_PRIORITIES.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case TASK_PRIORITIES.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-600">İletişim geçmişi yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header ve İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam İletişim</p>
                <p className="text-2xl font-bold">{stats?.totalCommunications || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen Görev</p>
                <p className="text-2xl font-bold">{upcomingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Son İletişim</p>
                <p className="text-sm font-medium">
                  {stats?.lastContact 
                    ? format(new Date(stats.lastContact.toDate()), "dd MMM yyyy", { locale: tr })
                    : "Henüz yok"
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni İletişim
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCommunication ? "İletişimi Düzenle" : "Yeni İletişim Ekle"}
                      </DialogTitle>
                      <DialogDescription>
                        {companyName} firması ile yapılan iletişimi kaydedin.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">İletişim Türü</Label>
                          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(COMMUNICATION_TYPES).map((type) => (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center">
                                    {getTypeIcon(type)}
                                    <span className="ml-2">{getCommunicationTypeText(type)}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Durum</Label>
                          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={COMMUNICATION_STATUS.COMPLETED}>Tamamlandı</SelectItem>
                              <SelectItem value={COMMUNICATION_STATUS.SCHEDULED}>Planlandı</SelectItem>
                              <SelectItem value={COMMUNICATION_STATUS.CANCELLED}>İptal Edildi</SelectItem>
                              <SelectItem value={COMMUNICATION_STATUS.POSTPONED}>Ertelendi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Konu</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          placeholder="İletişimin konusu..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">İçerik/Notlar</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          placeholder="Görüşme detayları, notlar..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate">Tarih/Saat</Label>
                          <Input
                            id="scheduledDate"
                            type="datetime-local"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Öncelik</Label>
                          <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(TASK_PRIORITIES).map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {getPriorityText(priority)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="outcome">Sonuç/Çıktı</Label>
                        <Textarea
                          id="outcome"
                          value={formData.outcome}
                          onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                          placeholder="Görüşmenin sonucu, alınan kararlar..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nextAction">Sonraki Aksiyon</Label>
                        <Input
                          id="nextAction"
                          value={formData.nextAction}
                          onChange={(e) => setFormData({...formData, nextAction: e.target.value})}
                          placeholder="Yapılacak sonraki adım..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Etiketler</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                          placeholder="Etiketleri virgülle ayırın: proje, teklif, pazarlık..."
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => {
                          setIsAddDialogOpen(false);
                          setEditingCommunication(null);
                        }}>
                          İptal
                        </Button>
                        <Button type="submit">
                          {editingCommunication ? "Güncelle" : "Kaydet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bekleyen Görevler */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Bekleyen Görevler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(task.type)}
                    <div>
                      <p className="font-medium">{task.subject}</p>
                      <p className="text-sm text-gray-600">
                        {task.scheduledDate && format(new Date(task.scheduledDate.toDate()), "dd MMM yyyy HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => startEdit(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* İletişim Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle>İletişim Geçmişi</CardTitle>
          <CardDescription>
            {companyName} firması ile yapılan tüm iletişim kayıtları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz iletişim kaydı bulunmuyor.
              </div>
            ) : (
              communications.map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(comm.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{comm.subject}</h4>
                          <Badge className={getStatusColor(comm.status)}>
                            {comm.status === COMMUNICATION_STATUS.COMPLETED ? "Tamamlandı" :
                             comm.status === COMMUNICATION_STATUS.SCHEDULED ? "Planlandı" :
                             comm.status === COMMUNICATION_STATUS.CANCELLED ? "İptal" : "Ertelendi"}
                          </Badge>
                          {comm.priority && (
                            <Badge className={getPriorityColor(comm.priority)}>
                              {getPriorityText(comm.priority)}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-2">{comm.content}</p>
                        
                        {comm.outcome && (
                          <div className="bg-green-50 p-2 rounded text-sm mb-2">
                            <strong>Sonuç:</strong> {comm.outcome}
                          </div>
                        )}
                        
                        {comm.nextAction && (
                          <div className="bg-blue-50 p-2 rounded text-sm mb-2">
                            <strong>Sonraki Aksiyon:</strong> {comm.nextAction}
                          </div>
                        )}
                        
                        {comm.tags && comm.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {comm.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {comm.createdAt && format(new Date(comm.createdAt.toDate()), "dd MMM yyyy HH:mm", { locale: tr })}
                          {comm.scheduledDate && (
                            <>
                              <span className="mx-2">•</span>
                              <Calendar className="h-4 w-4 mr-1" />
                              Planlandı: {format(new Date(comm.scheduledDate.toDate()), "dd MMM yyyy HH:mm", { locale: tr })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(comm)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(comm.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}