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
  Timestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../firebase';
import { uploadFile, deleteFile } from '../storage';

const COLLECTION_NAME = 'contracts';

/**
 * Contract Service
 * Sözleşme yönetimi için Firebase işlemleri
 */

export const ContractService = {
  /**
   * Yeni sözleşme oluştur
   */
  async createContract(contractData) {
    try {
      // Dosyaları Storage'a yükle
      const attachments = [];
      if (contractData.files && contractData.files.length > 0) {
        for (const fileData of contractData.files) {
          try {
            const filePath = `contracts/${contractData.contractNumber}/attachments/${fileData.file.name}`;
            const url = await uploadFile(fileData.file, filePath);
            attachments.push({
              name: fileData.name,
              url: url,
              type: fileData.type,
              size: fileData.size,
              uploadedAt: Timestamp.now()
            });
          } catch (uploadError) {
            // Dosya yükleme hatası varsa devam et ama kullanıcıya bildir
            return {
              success: false,
              error: `Dosya yükleme hatası: ${uploadError.message || 'Bilinmeyen hata'}`
            };
          }
        }
      }

      // files field'ini çıkar ve temiz data oluştur
      const { files, ...cleanContractData } = contractData;
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...cleanContractData,
        attachments, // Storage URL'lerini ekle (boş array olabilir)
        status: 'draft', // draft, active, completed, cancelled
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Company doc'a sözleşme bilgisini ekle
      if (contractData.companyId) {
        await this.addContractToCompany(contractData.companyId, {
          contractId: docRef.id,
          contractNumber: contractData.contractNumber,
          contractType: contractData.contractType,
          status: 'draft',
          createdAt: Timestamp.now()
        });
      }

      return {
        success: true,
        id: docRef.id,
        message: 'Sözleşme başarıyla oluşturuldu'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Sözleşme güncelle
   */
  async updateContract(id, updateData) {
    try {
      // Dosyaları Storage'a yükle (varsa)
      if (updateData.files && updateData.files.length > 0) {
        const contract = await this.getContract(id);
        const existingAttachments = contract.contract?.attachments || [];
        
        const newAttachments = [];
        for (const fileData of updateData.files) {
          const filePath = `contracts/${contract.contract.contractNumber}/attachments/${fileData.file.name}`;
          const url = await uploadFile(fileData.file, filePath);
          newAttachments.push({
            name: fileData.name,
            url: url,
            type: fileData.type,
            size: fileData.size,
            uploadedAt: Timestamp.now()
          });
        }
        
        updateData.attachments = [...existingAttachments, ...newAttachments];
        delete updateData.files;
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });

      // Company doc'daki sözleşme bilgisini güncelle (status değişirse)
      if (updateData.status || updateData.contractNumber) {
        const contract = await this.getContract(id);
        if (contract.success && contract.contract.companyId) {
          await this.updateContractInCompany(
            contract.contract.companyId,
            id,
            {
              status: updateData.status,
              contractNumber: updateData.contractNumber,
              updatedAt: Timestamp.now()
            }
          );
        }
      }

      return {
        success: true,
        message: 'Sözleşme başarıyla güncellendi'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Sözleşme sil
   */
  async deleteContract(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return {
        success: true,
        message: 'Sözleşme başarıyla silindi'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Tek bir sözleşme getir
   */
  async getContract(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          contract: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          error: 'Sözleşme bulunamadı'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Tüm sözleşmeleri getir (filtreleme ve sayfalama ile)
   */
  async getContracts(options = {}) {
    try {
      const {
        contractType = null,
        status = null,
        companyId = null,
        orderByField = 'createdAt',
        orderDirection = 'desc',
        limitCount = 50,
        lastDoc = null
      } = options;

      let q = collection(db, COLLECTION_NAME);
      const constraints = [];

      // Filtreler
      if (contractType) {
        constraints.push(where('contractType', '==', contractType));
      }
      if (status) {
        constraints.push(where('status', '==', status));
      }
      if (companyId) {
        constraints.push(where('companyId', '==', companyId));
      }

      // Sıralama
      constraints.push(orderBy(orderByField, orderDirection));

      // Sayfalama
      if (limitCount) {
        constraints.push(limit(limitCount));
      }
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);

      const contracts = [];
      querySnapshot.forEach((doc) => {
        contracts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        contracts,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        contracts: []
      };
    }
  },

  /**
   * Sözleşme ara (firma adı, sözleşme numarası vb.)
   */
  async searchContracts(searchTerm) {
    try {
      const result = await this.getContracts({ limitCount: 200 });
      
      if (!result.success) {
        return result;
      }

      const filteredContracts = result.contracts.filter(contract => 
        contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.companyInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        contracts: filteredContracts
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        contracts: []
      };
    }
  },

  /**
   * Firma bazlı sözleşmeleri getir
   */
  async getContractsByCompany(companyId) {
    try {
      return await this.getContracts({ 
        companyId, 
        limitCount: 100 
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        contracts: []
      };
    }
  },

  /**
   * Sözleşme istatistikleri
   */
  async getContractStats() {
    try {
      const result = await this.getContracts({ limitCount: 1000 });
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      const contracts = result.contracts;
      const stats = {
        total: contracts.length,
        draft: contracts.filter(c => c.status === 'draft').length,
        active: contracts.filter(c => c.status === 'active').length,
        completed: contracts.filter(c => c.status === 'completed').length,
        cancelled: contracts.filter(c => c.status === 'cancelled').length,
        byType: {}
      };

      // Tip bazında sayılar
      contracts.forEach(contract => {
        const type = contract.contractType;
        if (!stats.byType[type]) {
          stats.byType[type] = 0;
        }
        stats.byType[type]++;
      });

      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Sözleşme durumu güncelle
   */
  async updateContractStatus(id, status) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Sözleşme durumu güncellendi'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Sözleşmeye not ekle
   */
  async addContractNote(contractId, noteData) {
    try {
      const contractRef = doc(db, COLLECTION_NAME, contractId);
      const contractSnap = await getDoc(contractRef);

      if (!contractSnap.exists()) {
        return {
          success: false,
          error: 'Sözleşme bulunamadı'
        };
      }

      const currentNotes = contractSnap.data().notes || [];
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: Timestamp.now()
      };

      await updateDoc(contractRef, {
        notes: [newNote, ...currentNotes],
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        note: newNote,
        message: 'Not başarıyla eklendi'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Süresi yaklaşan sözleşmeleri getir
   */
  async getExpiringContracts(daysAhead = 30) {
    try {
      const result = await this.getContracts({ 
        status: 'active',
        limitCount: 1000 
      });
      
      if (!result.success) {
        return result;
      }

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      const expiringContracts = result.contracts.filter(contract => {
        if (!contract.endDate) return false;
        const endDate = contract.endDate.toDate ? contract.endDate.toDate() : new Date(contract.endDate);
        return endDate >= today && endDate <= futureDate;
      }).sort((a, b) => {
        const dateA = a.endDate.toDate ? a.endDate.toDate() : new Date(a.endDate);
        const dateB = b.endDate.toDate ? b.endDate.toDate() : new Date(b.endDate);
        return dateA - dateB;
      });

      return {
        success: true,
        contracts: expiringContracts
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        contracts: []
      };
    }
  },

  /**
   * Company doc'a sözleşme bilgisi ekle
   */
  async addContractToCompany(companyId, contractInfo) {
    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        contracts: arrayUnion(contractInfo),
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Company doc'daki sözleşme bilgisini güncelle
   */
  async updateContractInCompany(companyId, contractId, updates) {
    try {
      const companyRef = doc(db, 'companies', companyId);
      const companySnap = await getDoc(companyRef);
      
      if (!companySnap.exists()) {
        return { success: false, error: 'Company not found' };
      }

      const contracts = companySnap.data().contracts || [];
      const updatedContracts = contracts.map(c => 
        c.contractId === contractId ? { ...c, ...updates } : c
      );

      await updateDoc(companyRef, {
        contracts: updatedContracts,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Sözleşme dosyasını sil
   */
  async deleteAttachment(contractId, attachmentUrl) {
    try {
      const contract = await this.getContract(contractId);
      if (!contract.success) {
        return { success: false, error: 'Contract not found' };
      }

      // Storage'dan sil
      const path = attachmentUrl.split('/o/')[1]?.split('?')[0];
      if (path) {
        await deleteFile(decodeURIComponent(path));
      }

      // Firestore'dan kaldır
      const updatedAttachments = (contract.contract.attachments || []).filter(
        a => a.url !== attachmentUrl
      );

      await this.updateContract(contractId, {
        attachments: updatedAttachments
      });

      return { success: true, message: 'Dosya silindi' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default ContractService;
