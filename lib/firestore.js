import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Belge ekleme
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Belge güncelleme
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

// Belge silme
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    throw error;
  }
};

// Tek belge getirme
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Koleksiyon belgelerini getirme
export const getDocuments = async (collectionName, options = {}) => {
  try {
    let q = collection(db, collectionName);

    // Filtreleme
    if (options.where) {
      const [field, operator, value] = options.where;
      q = query(q, where(field, operator, value));
    }

    // Sıralama
    if (options.orderBy) {
      const [field, direction = "asc"] = options.orderBy;
      q = query(q, orderBy(field, direction));
    }

    // Limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return documents;
  } catch (error) {
    throw error;
  }
};

// Koleksiyon referansı al
export const getCollection = (collectionName) => {
  return collection(db, collectionName);
};

// Belge referansı al
export const getDocumentRef = (collectionName, docId) => {
  return doc(db, collectionName, docId);
};
