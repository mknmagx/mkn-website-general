import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'companies';

/**
 * Company Service
 * Handles all company-related Firebase operations
 */

export const CompanyService = {
  /**
   * Create a new company
   */
  async createCompany(companyData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...companyData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        id: docRef.id,
        message: 'Firma başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Error creating company:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Update an existing company
   */
  async updateCompany(id, updateData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Firma başarıyla güncellendi'
      };
    } catch (error) {
      console.error('Error updating company:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Delete a company
   */
  async deleteCompany(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return {
        success: true,
        message: 'Firma başarıyla silindi'
      };
    } catch (error) {
      console.error('Error deleting company:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get a single company by ID
   */
  async getCompany(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          company: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          error: 'Firma bulunamadı'
        };
      }
    } catch (error) {
      console.error('Error getting company:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get all companies with optional filtering and pagination
   */
  async getCompanies(options = {}) {
    try {
      const {
        status = null,
        priority = null,
        industry = null,
        orderByField = 'createdAt',
        orderDirection = 'desc',
        limitCount = 50,
        lastDoc = null
      } = options;

      let q = collection(db, COLLECTION_NAME);
      const constraints = [];

      // Add filters
      if (status) {
        constraints.push(where('status', '==', status));
      }
      if (priority) {
        constraints.push(where('priority', '==', priority));
      }
      if (industry) {
        constraints.push(where('industry', '==', industry));
      }

      // Add ordering
      constraints.push(orderBy(orderByField, orderDirection));

      // Add pagination
      if (limitCount) {
        constraints.push(limit(limitCount));
      }
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);

      const companies = [];
      querySnapshot.forEach((doc) => {
        companies.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        companies,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Error getting companies:', error);
      return {
        success: false,
        error: error.message,
        companies: []
      };
    }
  },

  /**
   * Search companies by name or contact person
   */
  async searchCompanies(searchTerm) {
    try {
      // Firebase doesn't support full-text search, so we'll get all companies
      // and filter on the client side for now. For production, consider using
      // Algolia or similar service for better search capabilities.
      
      const result = await this.getCompanies({ limitCount: 100 });
      
      if (!result.success) {
        return result;
      }

      const filteredCompanies = result.companies.filter(company => 
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        companies: filteredCompanies
      };
    } catch (error) {
      console.error('Error searching companies:', error);
      return {
        success: false,
        error: error.message,
        companies: []
      };
    }
  },

  /**
   * Get company statistics
   */
  async getCompanyStats() {
    try {
      const result = await this.getCompanies({ limitCount: 1000 });
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      const companies = result.companies;
      const stats = {
        total: companies.length,
        clients: companies.filter(c => c.status === 'client').length,
        prospects: companies.filter(c => c.status === 'prospect').length,
        active: companies.filter(c => c.status === 'active').length,
        inactive: companies.filter(c => c.status === 'inactive').length,
        highPriority: companies.filter(c => c.priority === 'high').length,
        mediumPriority: companies.filter(c => c.priority === 'medium').length,
        lowPriority: companies.filter(c => c.priority === 'low').length
      };

      // Calculate monthly revenue from active clients
      const monthlyRevenue = companies
        .filter(c => c.status === 'client' && c.monthlyBudget)
        .reduce((total, company) => {
          const budget = parseFloat(company.monthlyBudget.replace(/[^0-9.]/g, ''));
          return total + (isNaN(budget) ? 0 : budget);
        }, 0);

      stats.monthlyRevenue = monthlyRevenue;

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error getting company stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Add a note to a company
   */
  async addCompanyNote(companyId, noteData) {
    try {
      const companyRef = doc(db, COLLECTION_NAME, companyId);
      const companySnap = await getDoc(companyRef);

      if (!companySnap.exists()) {
        return {
          success: false,
          error: 'Firma bulunamadı'
        };
      }

      const currentNotes = companySnap.data().notes || [];
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: Timestamp.now()
      };

      await updateDoc(companyRef, {
        notes: [newNote, ...currentNotes],
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        note: newNote,
        message: 'Not başarıyla eklendi'
      };
    } catch (error) {
      console.error('Error adding company note:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Add a reminder to a company
   */
  async addCompanyReminder(companyId, reminderData) {
    try {
      const companyRef = doc(db, COLLECTION_NAME, companyId);
      const companySnap = await getDoc(companyRef);

      if (!companySnap.exists()) {
        return {
          success: false,
          error: 'Firma bulunamadı'
        };
      }

      const currentReminders = companySnap.data().reminders || [];
      const newReminder = {
        id: Date.now().toString(),
        ...reminderData,
        status: 'pending',
        createdAt: Timestamp.now()
      };

      await updateDoc(companyRef, {
        reminders: [...currentReminders, newReminder],
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        reminder: newReminder,
        message: 'Hatırlatma başarıyla eklendi'
      };
    } catch (error) {
      console.error('Error adding company reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Update reminder status
   */
  async updateReminderStatus(companyId, reminderId, status) {
    try {
      const companyRef = doc(db, COLLECTION_NAME, companyId);
      const companySnap = await getDoc(companyRef);

      if (!companySnap.exists()) {
        return {
          success: false,
          error: 'Firma bulunamadı'
        };
      }

      const reminders = companySnap.data().reminders || [];
      const updatedReminders = reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status, updatedAt: Timestamp.now() }
          : reminder
      );

      await updateDoc(companyRef, {
        reminders: updatedReminders,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Hatırlatma durumu güncellendi'
      };
    } catch (error) {
      console.error('Error updating reminder status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get companies with upcoming reminders
   */
  async getUpcomingReminders(daysAhead = 7) {
    try {
      const result = await this.getCompanies({ limitCount: 1000 });
      
      if (!result.success) {
        return result;
      }

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      const companiesWithReminders = result.companies
        .map(company => {
          const upcomingReminders = (company.reminders || [])
            .filter(reminder => {
              if (reminder.status !== 'pending') return false;
              const reminderDate = new Date(reminder.date);
              return reminderDate >= today && reminderDate <= futureDate;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          return {
            ...company,
            upcomingReminders
          };
        })
        .filter(company => company.upcomingReminders.length > 0);

      return {
        success: true,
        companies: companiesWithReminders
      };
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return {
        success: false,
        error: error.message,
        companies: []
      };
    }
  }
};

export default CompanyService;