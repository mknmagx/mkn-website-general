import { useState, useEffect } from 'react';
import { packagingService, categoryService } from '@/lib/services/packaging-service';

export function usePackagingData() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, categoriesData] = await Promise.all([
        packagingService.getAllProducts(), // isActive filtresi kaldırıldı
        categoryService.getAllCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading packaging data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  const getProductById = (id) => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (categoryName) => {
    if (!categoryName || categoryName === 'all') {
      return products;
    }
    return products.filter(product => product.category === categoryName);
  };

  const searchProducts = (query) => {
    if (!query.trim()) {
      return products;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.code.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      (product.description && product.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  const filterProducts = (filters) => {
    let filtered = products;

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.category.includes(product.category)
      );
    }

    if (filters.material && filters.material.length > 0) {
      filtered = filtered.filter(product => 
        filters.material.includes(product.specifications?.material)
      );
    }

    if (filters.size && filters.size.length > 0) {
      filtered = filtered.filter(product => 
        filters.size.includes(product.specifications?.size)
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && product.colors.some(color => 
          filters.colors.includes(color)
        )
      );
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(product => product.inStock === filters.inStock);
    }

    return filtered;
  };

  // Get unique values for filter options
  const getFilterOptions = () => {
    const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const allMaterials = [...new Set(products.map(p => p.specifications?.material).filter(Boolean))];
    const allSizes = [...new Set(products.map(p => p.specifications?.size).filter(Boolean))];
    const allColors = [...new Set(products.flatMap(p => p.colors || []).filter(Boolean))];

    return {
      categories: allCategories,
      materials: allMaterials,
      sizes: allSizes,
      colors: allColors
    };
  };

  return {
    products,
    categories,
    loading,
    error,
    refreshData,
    getProductById,
    getProductsByCategory,
    searchProducts,
    filterProducts,
    getFilterOptions
  };
}