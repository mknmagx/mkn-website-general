"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "../../../lib/utils/date-utils";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  DollarSign,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useToast } from "../../../hooks/use-toast";

export function ReturnsSection({ returns, onUpdateReturn, onProcessReturn }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReturnDetail, setShowReturnDetail] = useState(false);
  const [processingReturn, setProcessingReturn] = useState(null);

  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch = 
      returnItem.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || returnItem.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Bekliyor
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Reddedildi
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1" />
            İşleniyor
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tamamlandı
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReasonBadge = (reason) => {
    const reasons = {
      "Damaged": { label: "Hasarlı", color: "bg-red-100 text-red-800" },
      "Wrong Item": { label: "Yanlış Ürün", color: "bg-orange-100 text-orange-800" },
      "Not as Described": { label: "Açıklamaya Uymuyor", color: "bg-yellow-100 text-yellow-800" },
      "Quality Issue": { label: "Kalite Sorunu", color: "bg-red-100 text-red-800" },
      "Customer Changed Mind": { label: "Müşteri Vazgeçti", color: "bg-gray-100 text-gray-800" }
    };

    const reasonInfo = reasons[reason];
    return reasonInfo ? (
      <Badge className={reasonInfo.color}>{reasonInfo.label}</Badge>
    ) : (
      <Badge variant="secondary">{reason}</Badge>
    );
  };

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowReturnDetail(true);
  };

  const handleProcessReturn = (returnId, action, data) => {
    setProcessingReturn(returnId);
    
    // Simulate processing
    setTimeout(() => {
      onProcessReturn?.(returnId, action, data);
      setProcessingReturn(null);
      setShowReturnDetail(false);
      
      toast({
        title: "İade İşlemi",
        description: `İade ${action === "approve" ? "onaylandı" : "reddedildi"}`,
        duration: 3000,
      });
    }, 1000);
  };

  const totalReturnValue = filteredReturns.reduce((sum, ret) => sum + ret.totalRefund, 0);
  const pendingReturns = filteredReturns.filter(ret => ret.status === "pending").length;
  const avgRefundAmount = filteredReturns.length > 0 ? totalReturnValue / filteredReturns.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">İade Yönetimi</h2>
          <p className="text-gray-600">Ürün iadeleri ve geri dönüş süreçlerini yönet</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            İade Raporu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <RotateCcw className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam İade</p>
                <p className="text-2xl font-bold">{filteredReturns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen İade</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam İade Tutarı</p>
                <p className="text-2xl font-bold">{formatCurrency(totalReturnValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama İade</p>
                <p className="text-2xl font-bold">{formatCurrency(avgRefundAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="İade ara (sipariş no, müşteri)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="approved">Onaylandı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="processing">İşleniyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>İade Listesi</CardTitle>
          <CardDescription>
            {filteredReturns.length} iade gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş No</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>İade Sebebi</TableHead>
                <TableHead>Talep Tarihi</TableHead>
                <TableHead>İade Tutarı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Atanan</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell>
                    <div className="font-medium">{returnItem.orderNumber}</div>
                    <div className="text-sm text-gray-500">
                      {returnItem.items.length} ürün
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{returnItem.customerName}</div>
                    <div className="text-sm text-gray-500">{returnItem.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div>{getReasonBadge(returnItem.items[0]?.reason)}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {returnItem.returnReason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(returnItem.requestDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(returnItem.totalRefund)}
                    </div>
                    <div className="text-sm text-gray-500">
                      -{formatCurrency(returnItem.shippingCost)} kargo
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {returnItem.assignedTo || "Atanmamış"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewReturn(returnItem)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detayları Gör
                        </DropdownMenuItem>
                        {returnItem.status === "pending" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleProcessReturn(returnItem.id, "approve", {})}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Onayla
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleProcessReturn(returnItem.id, "reject", {})}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reddet
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          İade Formu
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Return Detail Modal */}
      <Dialog open={showReturnDetail} onOpenChange={setShowReturnDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReturn && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  İade Detayı - {selectedReturn.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  İade talebi bilgileri ve işlem seçenekleri
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Detaylar</TabsTrigger>
                  <TabsTrigger value="items">Ürünler</TabsTrigger>
                  <TabsTrigger value="process">İşlem</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Return Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle>İade Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sipariş No:</span>
                          <span className="font-medium">{selectedReturn.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Müşteri:</span>
                          <span className="font-medium">{selectedReturn.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">E-posta:</span>
                          <span className="font-medium">{selectedReturn.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Talep Tarihi:</span>
                          <span className="font-medium">{formatDate(selectedReturn.requestDate)}</span>
                        </div>
                        {selectedReturn.processedDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">İşlenme Tarihi:</span>
                            <span className="font-medium">{formatDate(selectedReturn.processedDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Durum:</span>
                          {getStatusBadge(selectedReturn.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Atanan Kişi:</span>
                          <span className="font-medium">{selectedReturn.assignedTo || "Atanmamış"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Financial Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Mali Bilgiler</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">İade Tutarı:</span>
                          <span className="font-medium">{formatCurrency(selectedReturn.refundAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kargo Ücreti:</span>
                          <span className="font-medium">-{formatCurrency(selectedReturn.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stok Ücreti:</span>
                          <span className="font-medium">-{formatCurrency(selectedReturn.restockFee)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net İade:</span>
                          <span>{formatCurrency(selectedReturn.totalRefund)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Return Reason */}
                  <Card>
                    <CardHeader>
                      <CardTitle>İade Sebebi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="font-medium">{selectedReturn.returnReason}</div>
                        {selectedReturn.notes && (
                          <div className="text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>Notlar:</strong> {selectedReturn.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>İade Edilen Ürünler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedReturn.items.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="text-sm text-gray-600 mt-1">
                                  Miktar: {item.quantity} adet
                                </div>
                              </div>
                              {getReasonBadge(item.reason)}
                            </div>
                            
                            {item.images && item.images.length > 0 && (
                              <div className="mt-3">
                                <Label className="text-sm font-medium">Ürün Fotoğrafları:</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {item.images.map((image, index) => (
                                    <div key={index} className="w-20 h-20 bg-gray-100 rounded border">
                                      <img 
                                        src={image} 
                                        alt={`Return image ${index + 1}`}
                                        className="w-full h-full object-cover rounded"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="process" className="space-y-4">
                  {selectedReturn.status === "pending" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-green-600">İade Onayı</CardTitle>
                          <CardDescription>
                            İadeyi onaylayıp para iadesi başlat
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="approveNotes">Onay Notları</Label>
                            <Textarea
                              id="approveNotes"
                              placeholder="Onay ile ilgili notlar..."
                              rows={3}
                            />
                          </div>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleProcessReturn(selectedReturn.id, "approve", {})}
                            disabled={processingReturn === selectedReturn.id}
                          >
                            {processingReturn === selectedReturn.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            İadeyi Onayla
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-red-600">İade Reddi</CardTitle>
                          <CardDescription>
                            İade talebini gerekçeli olarak reddet
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="rejectReason">Red Gerekçesi</Label>
                            <Textarea
                              id="rejectReason"
                              placeholder="Red gerekçesini açıklayın..."
                              rows={3}
                              required
                            />
                          </div>
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => handleProcessReturn(selectedReturn.id, "reject", {})}
                            disabled={processingReturn === selectedReturn.id}
                          >
                            {processingReturn === selectedReturn.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            İadeyi Reddet
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>İşlem Tamamlandı</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          {getStatusBadge(selectedReturn.status)}
                          <p className="mt-4 text-gray-600">
                            Bu iade talebi işlenmiştir.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}