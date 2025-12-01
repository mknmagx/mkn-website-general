"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  MessageSquare,
  Plus,
  Phone,
  Mail,
  Users,
  Video,
  Search,
} from "lucide-react";
import {
  createCommunication,
  COMMUNICATION_TYPES,
  COMMUNICATION_STATUS,
  TASK_PRIORITIES,
  getCommunicationTypeText,
  getPriorityText,
} from "../lib/services/company-communications";
import { getAllCompanies } from "../lib/services/companies-service";

export default function QuickCommunicationModal() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    companyId: "",
    companyName: "",
    type: COMMUNICATION_TYPES.PHONE_CALL,
    subject: "",
    content: "",
    priority: TASK_PRIORITIES.MEDIUM,
    status: COMMUNICATION_STATUS.COMPLETED,
  });

  // Firmaları yükle
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await getAllCompanies();
        setCompanies(companiesData || []);
      } catch (error) {
        toast({
          title: "Hata",
          description: "Firmalar yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
        setCompanies([]);
      }
    };
    
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  // Filtrelenmiş firmalar
  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyId || !formData.subject || !formData.content) {
      toast({
        title: "Uyarı",
        description: "Lütfen tüm zorunlu alanları doldurun!",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCommunication(formData);
      
      // Form'u sıfırla
      setFormData({
        companyId: "",
        companyName: "",
        type: COMMUNICATION_TYPES.PHONE_CALL,
        subject: "",
        content: "",
        priority: TASK_PRIORITIES.MEDIUM,
        status: COMMUNICATION_STATUS.COMPLETED,
      });
      
      setIsOpen(false);
      toast({
        title: "Başarılı",
        description: "Görüşme başarıyla kaydedildi!",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görüşme kaydedilirken hata oluştu!",
        variant: "destructive",
      });
    }
  };

  // Firma seçimi
  const handleCompanySelect = (company) => {
    setFormData({
      ...formData,
      companyId: company.id,
      companyName: company.name,
    });
    setSearchTerm(company.name);
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
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Hızlı Görüşme Ekle
              </DialogTitle>
              <DialogDescription>
                Herhangi bir firma ile yaptığınız görüşmeyi hızlıca kaydedin.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Firma Seçimi */}
              <div className="space-y-2">
                <Label htmlFor="company">Firma *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Firma ara..."
                    className="pl-10"
                    required
                  />
                  
                  {/* Firma Seçim Dropdown */}
                  {searchTerm && !formData.companyId && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.slice(0, 5).map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleCompanySelect(company)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                          >
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-gray-600">{company.contactPerson}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">Firma bulunamadı</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* İletişim Türü */}
                <div className="space-y-2">
                  <Label htmlFor="type">İletişim Türü *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(COMMUNICATION_TYPES).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type)}
                            <span>{getCommunicationTypeText(type)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Öncelik */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({...formData, priority: value})}
                  >
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

              {/* Konu */}
              <div className="space-y-2">
                <Label htmlFor="subject">Konu *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Görüşmenin konusu..."
                  required
                />
              </div>

              {/* İçerik */}
              <div className="space-y-2">
                <Label htmlFor="content">Görüşme Detayı *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Görüşme sırasında konuşulanlar, alınan kararlar..."
                  rows={4}
                  required
                />
              </div>

              {/* Form Butonları */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  Görüşmeyi Kaydet
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}