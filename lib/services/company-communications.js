import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  serverTimestamp,
  Timestamp,
} from "../firestore";

const COMMUNICATIONS_COLLECTION = "company_communications";
const COMPANIES_COLLECTION = "companies";

// İletişim türleri
export const COMMUNICATION_TYPES = {
  PHONE_CALL: "phone_call",
  EMAIL: "email", 
  MEETING: "meeting",
  VIDEO_CALL: "video_call",
  WHATSAPP: "whatsapp",
  PROPOSAL_SENT: "proposal_sent",
  CONTRACT_SIGNED: "contract_signed",
  PROJECT_STARTED: "project_started",
  FOLLOW_UP: "follow_up",
  NOTE: "note"
};

// İletişim durumları
export const COMMUNICATION_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  POSTPONED: "postponed"
};

// Firma durumları ve otomatik geçişler
export const COMPANY_STATUSES = {
  LEAD: "lead",
  FIRST_CONTACT: "first_contact", 
  PROPOSAL_SENT: "proposal_sent",
  NEGOTIATION: "negotiation",
  CONTRACT_PENDING: "contract_pending",
  ACTIVE_CLIENT: "active_client",
  PROJECT_COMPLETED: "project_completed",
  FOLLOW_UP: "follow_up",
  LOST: "lost",
  PAUSED: "paused"
};

// Görev öncelikleri
export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
  URGENT: "urgent"
};

/**
 * Firma ile iletişim kaydı oluştur
 */
export const createCommunication = async (communicationData) => {
  try {
    const communication = {
      ...communicationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: communicationData.status || COMMUNICATION_STATUS.COMPLETED
    };

    const docId = await addDocument(COMMUNICATIONS_COLLECTION, communication);
    
    // Firmanın son iletişim tarihini güncelle
    await updateCompanyLastContact(communicationData.companyId);
    
    // Otomatik durum geçişi kontrolü
    await checkAndUpdateCompanyStatus(communicationData.companyId, communicationData.type);
    
    return docId;
  } catch (error) {
    console.error("Error creating communication:", error);
    throw error;
  }
};

/**
 * Firma iletişim geçmişini getir
 */
export const getCompanyCommunications = async (companyId, limit = 50) => {
  try {
    const communications = await getDocuments(COMMUNICATIONS_COLLECTION, {
      where: [["companyId", "==", companyId]],
      orderBy: ["createdAt", "desc"],
      limit: limit
    });
    return communications;
  } catch (error) {
    console.error("Error fetching communications:", error);
    throw error;
  }
};

/**
 * İletişim kaydını güncelle
 */
export const updateCommunication = async (id, communicationData) => {
  try {
    const updatedData = {
      ...communicationData,
      updatedAt: serverTimestamp()
    };
    
    await updateDocument(COMMUNICATIONS_COLLECTION, id, updatedData);
    return true;
  } catch (error) {
    console.error("Error updating communication:", error);
    throw error;
  }
};

/**
 * İletişim kaydını sil
 */
export const deleteCommunication = async (id) => {
  try {
    await deleteDocument(COMMUNICATIONS_COLLECTION, id);
    return true;
  } catch (error) {
    console.error("Error deleting communication:", error);
    throw error;
  }
};

/**
 * Firmanın son iletişim tarihini güncelle
 */
const updateCompanyLastContact = async (companyId) => {
  try {
    await updateDocument(COMPANIES_COLLECTION, companyId, {
      lastContact: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating company last contact:", error);
  }
};

/**
 * İletişim türüne göre otomatik durum geçişi
 */
const checkAndUpdateCompanyStatus = async (companyId, communicationType) => {
  try {
    const company = await getDocument(COMPANIES_COLLECTION, companyId);
    if (!company) return;

    let newStatus = company.status;

    // Otomatik durum geçiş kuralları
    switch (communicationType) {
      case COMMUNICATION_TYPES.PHONE_CALL:
      case COMMUNICATION_TYPES.EMAIL:
      case COMMUNICATION_TYPES.MEETING:
        if (company.status === COMPANY_STATUSES.LEAD) {
          newStatus = COMPANY_STATUSES.FIRST_CONTACT;
        }
        break;
        
      case COMMUNICATION_TYPES.PROPOSAL_SENT:
        newStatus = COMPANY_STATUSES.PROPOSAL_SENT;
        break;
        
      case COMMUNICATION_TYPES.CONTRACT_SIGNED:
        newStatus = COMPANY_STATUSES.ACTIVE_CLIENT;
        break;
        
      case COMMUNICATION_TYPES.PROJECT_STARTED:
        newStatus = COMPANY_STATUSES.ACTIVE_CLIENT;
        break;
    }

    // Durum değişmişse güncelle
    if (newStatus !== company.status) {
      await updateDocument(COMPANIES_COLLECTION, companyId, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Durum değişikliği için otomatik not ekle
      await createCommunication({
        companyId: companyId,
        type: COMMUNICATION_TYPES.NOTE,
        subject: "Otomatik Durum Güncellemesi",
        content: `Firma durumu "${getStatusText(company.status)}" durumundan "${getStatusText(newStatus)}" durumuna otomatik olarak güncellendi.`,
        isSystemGenerated: true
      });
    }
  } catch (error) {
    console.error("Error checking company status:", error);
  }
};

/**
 * Gelecek görevleri getir (takip edilecek aksiyonlar)
 */
export const getUpcomingTasks = async (companyId = null, days = 7) => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    // Firestore Timestamp'e çevir
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    let whereConditions = [
      ["scheduledDate", ">=", startTimestamp],
      ["scheduledDate", "<=", endTimestamp],
      ["status", "==", COMMUNICATION_STATUS.SCHEDULED]
    ];

    if (companyId) {
      whereConditions.push(["companyId", "==", companyId]);
    }

    const tasks = await getDocuments(COMMUNICATIONS_COLLECTION, {
      where: whereConditions,
      orderBy: ["scheduledDate", "asc"]
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    throw error;
  }
};

/**
 * Firma raporları için istatistikler
 */
export const getCompanyStats = async (companyId) => {
  try {
    const communications = await getCompanyCommunications(companyId, 1000);
    
    const stats = {
      totalCommunications: communications.length,
      lastContact: null,
      communicationsByType: {},
      monthlyActivity: {},
      averageResponseTime: 0
    };

    // İletişim türlerine göre grupla
    communications.forEach(comm => {
      const type = comm.type;
      if (!stats.communicationsByType[type]) {
        stats.communicationsByType[type] = 0;
      }
      stats.communicationsByType[type]++;

      // Son iletişim
      if (!stats.lastContact || comm.createdAt > stats.lastContact) {
        stats.lastContact = comm.createdAt;
      }

      // Aylık aktivite
      const month = new Date(comm.createdAt?.toDate?.() || comm.createdAt).toISOString().substring(0, 7);
      if (!stats.monthlyActivity[month]) {
        stats.monthlyActivity[month] = 0;
      }
      stats.monthlyActivity[month]++;
    });

    return stats;
  } catch (error) {
    console.error("Error getting company stats:", error);
    throw error;
  }
};

/**
 * Genel raporlama fonksiyonları
 */
export const getDailyReport = async (date = new Date()) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Firestore Timestamp'e çevir
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const communications = await getDocuments(COMMUNICATIONS_COLLECTION, {
      where: [
        ["createdAt", ">=", startTimestamp],
        ["createdAt", "<=", endTimestamp]
      ],
      orderBy: ["createdAt", "desc"]
    });

    const report = {
      date: date.toISOString().split('T')[0],
      totalContacts: communications.length,
      byType: {},
      newLeads: 0,
      proposalsSent: 0,
      contractsSigned: 0,
      companies: new Set()
    };

    communications.forEach(comm => {
      // Tip bazında sayma
      if (!report.byType[comm.type]) {
        report.byType[comm.type] = 0;
      }
      report.byType[comm.type]++;

      // Özel sayımlar
      if (comm.type === COMMUNICATION_TYPES.PROPOSAL_SENT) {
        report.proposalsSent++;
      }
      if (comm.type === COMMUNICATION_TYPES.CONTRACT_SIGNED) {
        report.contractsSigned++;
      }

      // Benzersiz firmalar
      report.companies.add(comm.companyId);
    });

    report.uniqueCompanies = report.companies.size;
    delete report.companies; // Set'i temizle

    return report;
  } catch (error) {
    console.error("Error generating daily report:", error);
    throw error;
  }
};

/**
 * Yardımcı fonksiyonlar
 */
export const getStatusText = (status) => {
  const statusTexts = {
    [COMPANY_STATUSES.LEAD]: "Potansiyel",
    [COMPANY_STATUSES.FIRST_CONTACT]: "İlk İletişim",
    [COMPANY_STATUSES.PROPOSAL_SENT]: "Teklif Gönderildi",
    [COMPANY_STATUSES.NEGOTIATION]: "Görüşme",
    [COMPANY_STATUSES.CONTRACT_PENDING]: "Sözleşme Bekliyor",
    [COMPANY_STATUSES.ACTIVE_CLIENT]: "Aktif Müşteri",
    [COMPANY_STATUSES.PROJECT_COMPLETED]: "Proje Tamamlandı",
    [COMPANY_STATUSES.FOLLOW_UP]: "Takip",
    [COMPANY_STATUSES.LOST]: "Kaybedildi",
    [COMPANY_STATUSES.PAUSED]: "Beklemede"
  };
  return statusTexts[status] || status;
};

export const getCommunicationTypeText = (type) => {
  const typeTexts = {
    [COMMUNICATION_TYPES.PHONE_CALL]: "Telefon Görüşmesi",
    [COMMUNICATION_TYPES.EMAIL]: "E-posta",
    [COMMUNICATION_TYPES.MEETING]: "Toplantı",
    [COMMUNICATION_TYPES.VIDEO_CALL]: "Video Görüşmesi",
    [COMMUNICATION_TYPES.WHATSAPP]: "WhatsApp",
    [COMMUNICATION_TYPES.PROPOSAL_SENT]: "Teklif Gönderildi",
    [COMMUNICATION_TYPES.CONTRACT_SIGNED]: "Sözleşme İmzalandı",
    [COMMUNICATION_TYPES.PROJECT_STARTED]: "Proje Başlatıldı",
    [COMMUNICATION_TYPES.FOLLOW_UP]: "Takip",
    [COMMUNICATION_TYPES.NOTE]: "Not"
  };
  return typeTexts[type] || type;
};

export const getPriorityText = (priority) => {
  const priorityTexts = {
    [TASK_PRIORITIES.LOW]: "Düşük",
    [TASK_PRIORITIES.MEDIUM]: "Orta",
    [TASK_PRIORITIES.HIGH]: "Yüksek", 
    [TASK_PRIORITIES.URGENT]: "Acil"
  };
  return priorityTexts[priority] || priority;
};