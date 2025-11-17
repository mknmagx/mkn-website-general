"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { packagingService } from "@/lib/services/packaging-service";
import { Plus, Minus, Save, X } from "lucide-react";

// Aesthetic price rounding function
const beautifyPrice = (price) => {
  return Math.round(price * 20) / 20; // 0.05 increments
};

export default function QuickPriceEditDialog({
  product,
  isOpen,
  onClose,
  onSave,
}) {
  const { toast } = useToast();
  const [priceRanges, setPriceRanges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      // Initialize with existing price ranges or create default ones
      const existingRanges = product.business?.priceRanges || [];

      if (existingRanges.length > 0) {
        // Format existing ranges to match our dialog structure
        const formattedRanges = existingRanges.map((range) => {
          let minQuantity = 0;
          let maxQuantity = 0;
          let price = 0;
          let currency = "TRY";

          // Extract minQuantity
          if (typeof range.minQuantity === "number") {
            minQuantity = range.minQuantity;
          } else {
            minQuantity = parseInt(range.minQuantity || range.quantity || 0);
          }

          // Extract maxQuantity
          if (typeof range.maxQuantity === "number") {
            maxQuantity = range.maxQuantity;
          } else {
            maxQuantity = parseInt(range.maxQuantity || 0);
          }

          // Extract price
          if (typeof range.price === "number") {
            price = range.price;
          } else {
            price = parseFloat(range.price || 0);
          }

          // Extract currency
          currency = range.currency || "TRY";

          return {
            minQuantity: Math.max(0, minQuantity),
            maxQuantity: Math.max(0, maxQuantity),
            price: Math.max(0, price),
            currency: currency,
          };
        });

        setPriceRanges(formattedRanges);
      } else {
        // Default price ranges with proper schema
        setPriceRanges([
          { minQuantity: 50, maxQuantity: 500, price: 0, currency: "TRY" },
          { minQuantity: 501, maxQuantity: 2000, price: 0, currency: "TRY" },
          { minQuantity: 2001, maxQuantity: 5000, price: 0, currency: "TRY" },
        ]);
      }
    }
  }, [product, isOpen]);

  const handlePriceChange = (index, field, value) => {
    const updatedRanges = [...priceRanges];

    if (field === "price") {
      // Apply aesthetic rounding for price
      const numValue = parseFloat(value) || 0;
      updatedRanges[index][field] = numValue > 0 ? beautifyPrice(numValue) : 0;
    } else if (field === "minQuantity" || field === "maxQuantity") {
      // Handle quantity fields as integers
      const numValue = parseInt(value) || 0;
      updatedRanges[index][field] = Math.max(0, numValue);

      // Auto-adjust ranges to prevent overlaps
      if (field === "minQuantity" && index > 0) {
        // Update previous range's maxQuantity to minQuantity - 1
        const prevIndex = index - 1;
        if (numValue > 0) {
          updatedRanges[prevIndex].maxQuantity = numValue - 1;
        }
      } else if (field === "maxQuantity" && index < priceRanges.length - 1) {
        // Update next range's minQuantity to maxQuantity + 1
        const nextIndex = index + 1;
        if (numValue > 0) {
          updatedRanges[nextIndex].minQuantity = numValue + 1;
        }
      }
    } else if (field === "currency") {
      updatedRanges[index][field] = value;
    }

    setPriceRanges(updatedRanges);
  };

  const addPriceRange = () => {
    const lastRange = priceRanges[priceRanges.length - 1];
    const newMinQuantity = lastRange ? lastRange.maxQuantity + 1 : 1;
    const newMaxQuantity = lastRange ? lastRange.maxQuantity + 1000 : 1000;

    setPriceRanges([
      ...priceRanges,
      {
        minQuantity: newMinQuantity,
        maxQuantity: newMaxQuantity,
        price: 0,
        currency: "TRY",
      },
    ]);
  };

  const removePriceRange = (index) => {
    if (priceRanges.length > 1) {
      setPriceRanges(priceRanges.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate price ranges
      const validRanges = priceRanges.filter(
        (range) =>
          range.minQuantity > 0 &&
          range.maxQuantity > 0 &&
          range.price >= 0 &&
          range.minQuantity <= range.maxQuantity
      );

      if (validRanges.length === 0) {
        toast({
          title: "Hata",
          description: "En az bir geçerli fiyat aralığı giriniz",
          variant: "destructive",
        });
        return;
      }

      // Sort by minQuantity and ensure proper format
      validRanges.sort((a, b) => a.minQuantity - b.minQuantity);

      // Format ranges for database
      const formattedRanges = validRanges.map((range) => ({
        minQuantity: range.minQuantity,
        maxQuantity: range.maxQuantity,
        price: range.price,
        currency: range.currency || "TRY",
      }));

      // Update product with new price ranges
      const updatedBusiness = {
        ...product.business,
        priceRanges: formattedRanges,
      };

      // Ensure product.id is a string for Firestore
      const productId = String(product.id);

      await packagingService.updateProduct(productId, {
        ...product,
        business: updatedBusiness,
      });

      toast({
        title: "Başarılı",
        description: "Fiyat aralıkları güncellendi",
      });

      if (onSave) {
        onSave({
          ...product,
          business: updatedBusiness,
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPreview = () => {
    const validRanges = priceRanges.filter(
      (range) =>
        range.minQuantity > 0 &&
        range.maxQuantity > 0 &&
        range.price >= 0 &&
        range.minQuantity <= range.maxQuantity
    );

    if (validRanges.length === 0) return "Fiyat belirtilmedi";

    const prices = validRanges.map((r) => r.price).sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];

    if (min === max) {
      return `${min.toFixed(2)} TRY`;
    }
    return `${min.toFixed(2)} - ${max.toFixed(2)} TRY`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fiyat Düzenleme</DialogTitle>
          <DialogDescription>
            {product?.name} için fiyat aralıklarını düzenleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {priceRanges.map((range, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor={`minQuantity-${index}`}>Min Miktar</Label>
                <Input
                  id={`minQuantity-${index}`}
                  type="number"
                  value={range.minQuantity || ""}
                  onChange={(e) =>
                    handlePriceChange(index, "minQuantity", e.target.value)
                  }
                  placeholder="Minimum miktar"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`maxQuantity-${index}`}>Max Miktar</Label>
                <Input
                  id={`maxQuantity-${index}`}
                  type="number"
                  value={range.maxQuantity || ""}
                  onChange={(e) =>
                    handlePriceChange(index, "maxQuantity", e.target.value)
                  }
                  placeholder="Maksimum miktar"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`price-${index}`}>Fiyat (TRY)</Label>
                <Input
                  id={`price-${index}`}
                  type="number"
                  step="0.05"
                  value={range.price || ""}
                  onChange={(e) =>
                    handlePriceChange(index, "price", e.target.value)
                  }
                  placeholder="Birim fiyat"
                  min="0"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePriceRange(index)}
                disabled={priceRanges.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addPriceRange}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Fiyat Aralığı Ekle
          </Button>

          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Önizleme:</Label>
            <p className="text-lg font-semibold text-primary mt-1">
              {formatPreview()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            İptal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
