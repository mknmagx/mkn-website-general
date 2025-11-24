/**
 * Pricing Calculation Service
 * Handles all price calculations, unit conversions, and Firestore CRUD operations
 */

import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  orderBy,
  limit,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

const COLLECTION = "pricingCalculations";

// ============================================================================
// FIRESTORE CRUD OPERATIONS
// ============================================================================

/**
 * Save pricing calculation to Firestore
 * @param {Object} data - Calculation data
 * @returns {Promise<string>} Document ID
 */
export async function savePricingCalculation(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Get single pricing calculation by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Calculation data
 */
export async function getPricingCalculation(id) {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) {
    throw new Error("Hesaplama bulunamadı");
  }
  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

/**
 * Get all pricing calculations
 * @returns {Promise<Array>} Array of calculations
 */
export async function getPricingCalculations() {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Delete pricing calculation
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export async function deletePricingCalculation(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Convert amount to kilograms
 * @param {number} amount - Amount value
 * @param {string} unit - Unit type
 * @returns {number} Amount in kilograms
 */
export function convertToKilograms(amount, unit) {
  const value = parseFloat(amount) || 0;

  switch (unit) {
    case "kg":
      return value;
    case "gram":
      return value / 1000;
    case "ml":
      return value / 1000; // Assuming 1ml ≈ 1g density
    case "litre":
      return value;
    case "adet":
      return value; // For pieces, no conversion
    default:
      return value;
  }
}

/**
 * Convert amount to grams for percentage calculations
 * @param {number} amount - Amount value
 * @param {string} unit - Unit type
 * @returns {number} Amount in grams
 */
export function convertToGrams(amount, unit) {
  const value = parseFloat(amount) || 0;

  switch (unit) {
    case "kg":
      return value * 1000;
    case "gram":
      return value;
    case "ml":
      return value; // Assuming 1ml ≈ 1g density
    case "litre":
      return value * 1000;
    case "adet":
      return value; // For pieces, treat as is
    default:
      return value;
  }
}

/**
 * Calculate ingredient cost with proper unit conversion
 * @param {number} amount - Ingredient amount
 * @param {string} unit - Ingredient unit
 * @param {number} pricePerKg - Price per kilogram
 * @returns {number} Total cost
 */
export function calculateIngredientCost(amount, unit, pricePerKg) {
  const amountValue = parseFloat(amount) || 0;
  const price = parseFloat(pricePerKg) || 0;

  // For pieces, use price directly (price = per piece)
  if (unit === "adet") {
    return amountValue * price;
  }

  // Convert amount to kg for calculation
  const amountInKg = convertToKilograms(amountValue, unit);
  
  // Cost = amount_in_kg × price_per_kg
  // Example: 3 gram × 120 TL/kg = 0.003 kg × 120 = 0.36 TL
  return amountInKg * price;
}

/**
 * Calculate ingredient percentage in formula
 * @param {number} amount - Ingredient amount
 * @param {string} unit - Ingredient unit
 * @param {number} totalAmount - Total formula amount in grams
 * @returns {number} Percentage (0-100)
 */
export function calculateIngredientPercentage(amount, unit, totalAmount) {
  if (!totalAmount || totalAmount === 0) return 0;

  const amountInGrams = convertToGrams(amount, unit);
  return (amountInGrams / totalAmount) * 100;
}

/**
 * Calculate total product volume/weight in grams
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} Total amount in grams
 */
export function calculateTotalProductVolume(ingredients) {
  return ingredients.reduce((sum, ing) => {
    const amount = parseFloat(ing.amount) || 0;
    const amountInGrams = convertToGrams(amount, ing.unit);
    return sum + amountInGrams;
  }, 0);
}

/**
 * Calculate complete pricing breakdown
 * @param {Object} formData - Form data object
 * @returns {Object} Pricing breakdown object
 */
export function calculatePricing(formData) {
  const quantity = parseFloat(formData.quantity) || 1;

  // Calculate total product volume (for one unit)
  const totalProductVolume = calculateTotalProductVolume(formData.ingredients);

  // Calculate ingredient costs for ONE unit
  let ingredientsCostPerUnit = 0;
  const ingredientDetails = formData.ingredients.map((ing) => {
    const amount = parseFloat(ing.amount) || 0;
    const price = parseFloat(ing.price) || 0;

    const costPerUnit = calculateIngredientCost(amount, ing.unit, price);
    const percentage = calculateIngredientPercentage(
      amount,
      ing.unit,
      totalProductVolume
    );

    ingredientsCostPerUnit += costPerUnit;

    return {
      name: ing.name,
      amount,
      unit: ing.unit,
      percentage: percentage.toFixed(2),
      pricePerKg: price.toFixed(2),
      costPerUnit: costPerUnit.toFixed(2),
      costTotal: (costPerUnit * quantity).toFixed(2),
    };
  });

  // Total ingredients cost for all units
  const ingredientsCostTotal = ingredientsCostPerUnit * quantity;

  // Packaging cost (per unit)
  // Note: packaging quantity is per unit, so we don't multiply by quantity here
  const packagingCostPerUnit = formData.packaging.reduce((sum, pkg) => {
    const quantityPkg = parseFloat(pkg.quantity) || 0;
    const price = parseFloat(pkg.price) || 0;
    return sum + (quantityPkg * price);
  }, 0);
  const packagingCostTotal = packagingCostPerUnit * quantity;

  // Box cost (per unit)
  // boxQuantity is per unit (e.g., 1 box per product), boxPrice is per box
  const boxQuantity = parseFloat(formData.boxQuantity) || 0;
  const boxPrice = parseFloat(formData.boxPrice) || 0;
  const boxCostPerUnit = boxQuantity * boxPrice;
  const boxCostTotal = boxCostPerUnit * quantity;

  // Label cost (per unit)
  // labelQuantity is per unit (e.g., 1 label per product), labelPrice is per label
  const labelQuantity = parseFloat(formData.labelQuantity) || 0;
  const labelPrice = parseFloat(formData.labelPrice) || 0;
  const labelCostPerUnit = labelQuantity * labelPrice;
  const labelCostTotal = labelCostPerUnit * quantity;

  // Labor cost (per unit - not hourly!)
  const laborCostPerUnit = parseFloat(formData.laborCostPerUnit) || 0;
  const laborCostTotal = laborCostPerUnit * quantity;

  // Other costs (total - not per unit)
  const otherCostTotal = formData.otherCosts.reduce((sum, cost) => {
    return sum + (parseFloat(cost.amount) || 0);
  }, 0);
  const otherCostPerUnit = otherCostTotal / quantity;

  // Total cost per unit
  const totalCostPerUnit = 
    ingredientsCostPerUnit + 
    packagingCostPerUnit + 
    boxCostPerUnit + 
    labelCostPerUnit + 
    laborCostPerUnit + 
    otherCostPerUnit;

  // Total cost for all units
  const totalCostTotal = totalCostPerUnit * quantity;

  // Profit calculation
  const profitType = formData.profitType || "percentage"; // "percentage" or "fixed"
  let profitPerUnit = 0;
  let profitTotal = 0;

  if (profitType === "percentage") {
    const profitMargin = parseFloat(formData.profitMarginPercent) || 0;
    profitPerUnit = (totalCostPerUnit * profitMargin) / 100;
    profitTotal = profitPerUnit * quantity;
  } else {
    // Fixed amount per unit
    profitPerUnit = parseFloat(formData.profitAmountPerUnit) || 0;
    profitTotal = profitPerUnit * quantity;
  }

  // Final prices
  const unitPrice = totalCostPerUnit + profitPerUnit;
  const totalPrice = unitPrice * quantity;

  return {
    // Per unit costs
    ingredientsCostPerUnit: ingredientsCostPerUnit.toFixed(2),
    packagingCostPerUnit: packagingCostPerUnit.toFixed(2),
    boxCostPerUnit: boxCostPerUnit.toFixed(2),
    labelCostPerUnit: labelCostPerUnit.toFixed(2),
    laborCostPerUnit: laborCostPerUnit.toFixed(2),
    otherCostPerUnit: otherCostPerUnit.toFixed(2),
    totalCostPerUnit: totalCostPerUnit.toFixed(2),
    profitPerUnit: profitPerUnit.toFixed(2),
    unitPrice: unitPrice.toFixed(2),

    // Total costs
    ingredientsCostTotal: ingredientsCostTotal.toFixed(2),
    packagingCostTotal: packagingCostTotal.toFixed(2),
    boxCostTotal: boxCostTotal.toFixed(2),
    labelCostTotal: labelCostTotal.toFixed(2),
    laborCostTotal: laborCostTotal.toFixed(2),
    otherCostTotal: otherCostTotal.toFixed(2),
    totalCostTotal: totalCostTotal.toFixed(2),
    profitTotal: profitTotal.toFixed(2),
    totalPrice: totalPrice.toFixed(2),

    // Other info
    ingredientDetails,
    quantity,
    totalProductVolume: totalProductVolume.toFixed(2),
    profitType,
    profitMarginPercent: formData.profitMarginPercent || 0,
  };
}

/**
 * Validate pricing data
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result {isValid: boolean, errors: Array}
 */
export function validatePricingData(formData) {
  const errors = [];

  // Check product name
  if (!formData.productName || formData.productName.trim() === "") {
    errors.push("Ürün adı gereklidir");
  }

  // Check quantity
  if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
    errors.push("Geçerli bir üretim miktarı giriniz");
  }

  // Check ingredients
  const validIngredients = formData.ingredients.filter(
    (ing) => ing.name && ing.amount
  );
  if (validIngredients.length === 0) {
    errors.push("En az bir hammadde eklemelisiniz");
  }

  // Check ingredient prices
  const missingPrices = formData.ingredients.filter(
    (ing) => ing.name && (!ing.price || parseFloat(ing.price) <= 0)
  );
  if (missingPrices.length > 0) {
    errors.push(`${missingPrices.length} hammaddenin fiyatı eksik`);
  }

  // Check profit
  const profitType = formData.profitType || "percentage";
  if (profitType === "percentage") {
    if (!formData.profitMarginPercent || parseFloat(formData.profitMarginPercent) < 0) {
      errors.push("Geçerli bir kar marjı giriniz");
    }
  } else {
    if (!formData.profitAmountPerUnit || parseFloat(formData.profitAmountPerUnit) < 0) {
      errors.push("Geçerli bir birim kar tutarı giriniz");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

/**
 * Calculate cost per unit for different quantities (bulk pricing)
 * @param {Object} pricing - Pricing object from calculatePricing
 * @param {Array} quantities - Array of quantity values
 * @returns {Array} Array of {quantity, unitPrice, totalPrice}
 */
export function calculateBulkPricing(pricing, quantities) {
  return quantities.map((qty) => ({
    quantity: qty,
    unitPrice: pricing.totalPrice / pricing.quantity,
    totalPrice: (pricing.totalPrice / pricing.quantity) * qty,
  }));
}
