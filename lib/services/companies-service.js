import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
} from "../firestore";

const COLLECTION_NAME = "companies";

// Tüm firmaları getir
export const getAllCompanies = async () => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      orderBy: ["createdAt", "desc"],
    });
    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

// Tek firma getir
export const getCompanyById = async (id) => {
  try {
    const company = await getDocument(COLLECTION_NAME, id);
    return company;
  } catch (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
};

// Yeni firma ekle
export const createCompany = async (companyData) => {
  try {
    const docId = await addDocument(COLLECTION_NAME, {
      ...companyData,
      // Default değerler
      status: companyData.status || "lead",
      priority: companyData.priority || "medium",
      businessLine: companyData.businessLine || "ambalaj",
      // Boş alanları varsayılan değerlerle doldur
      phone: companyData.phone || "",
      email: companyData.email || "",
      website: companyData.website || "",
      address: companyData.address || "",
      contactPerson: companyData.contactPerson || "",
      contactPosition: companyData.contactPosition || "",
      contactPhone: companyData.contactPhone || "",
      contactEmail: companyData.contactEmail || "",
      employees: companyData.employees || "",
      foundedYear: companyData.foundedYear || "",
      description: companyData.description || "",
      // Nested objects
      projectDetails: companyData.projectDetails || {
        productType: "",
        packagingType: "",
        monthlyVolume: "",
        unitPrice: "",
        expectedMonthlyValue: "",
        projectDescription: "",
        specifications: "",
        deliverySchedule: "",
      },
      contractDetails: companyData.contractDetails || {
        contractStart: "",
        contractEnd: "",
        contractValue: "",
        paymentTerms: "",
        deliveryTerms: "",
      },
      socialMedia: companyData.socialMedia || {
        linkedin: "",
        instagram: "",
        facebook: "",
        twitter: "",
      },
      // İstatistikler ve notlar
      totalProjects: 0,
      totalRevenue: 0,
      lastContact: null,
      notes: [],
      reminders: [],
      documents: [],
    });
    return docId;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

// Firma güncelle
export const updateCompany = async (id, companyData) => {
  try {
    await updateDocument(COLLECTION_NAME, id, companyData);
    return true;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
};

// Firma sil
export const deleteCompany = async (id) => {
  try {
    await deleteDocument(COLLECTION_NAME, id);
    return true;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};

// Durum bazlı firmaları getir
export const getCompaniesByStatus = async (status) => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      where: ["status", "==", status],
      orderBy: ["createdAt", "desc"],
    });
    return companies;
  } catch (error) {
    console.error("Error fetching companies by status:", error);
    throw error;
  }
};

// İş kolu bazlı firmaları getir
export const getCompaniesByBusinessLine = async (businessLine) => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      where: ["businessLine", "==", businessLine],
      orderBy: ["createdAt", "desc"],
    });
    return companies;
  } catch (error) {
    console.error("Error fetching companies by business line:", error);
    throw error;
  }
};

// Arama yap
export const searchCompanies = async (searchTerm) => {
  try {
    // Firestore'da full-text search olmadığı için tüm firmaları getirip client-side'da filtreleyeceğiz
    const allCompanies = await getAllCompanies();
    
    if (!searchTerm) return allCompanies;
    
    const filteredCompanies = allCompanies.filter((company) => {
      const searchFields = [
        company.name,
        company.email,
        company.phone,
        company.contactPerson,
        company.address,
        company.description,
      ];
      
      return searchFields.some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    return filteredCompanies;
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
};

// Firma notları güncelle
export const updateCompanyNotes = async (id, notes) => {
  try {
    await updateDocument(COLLECTION_NAME, id, { notes });
    return true;
  } catch (error) {
    console.error("Error updating company notes:", error);
    throw error;
  }
};

// Firma hatırlatıcıları güncelle
export const updateCompanyReminders = async (id, reminders) => {
  try {
    await updateDocument(COLLECTION_NAME, id, { reminders });
    return true;
  } catch (error) {
    console.error("Error updating company reminders:", error);
    throw error;
  }
};

// Son iletişim tarihini güncelle
export const updateLastContact = async (id) => {
  try {
    await updateDocument(COLLECTION_NAME, id, { 
      lastContact: new Date().toISOString() 
    });
    return true;
  } catch (error) {
    console.error("Error updating last contact:", error);
    throw error;
  }
};