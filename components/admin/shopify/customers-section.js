"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "../../../lib/utils/date-utils";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
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
  DialogTrigger,
} from "../../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import { Separator } from "../../ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Star,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

export function CustomersSection({ customers, orders }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = selectedSegment === "all" || customer.segment.toLowerCase() === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });

  const getCustomerOrders = (customerId) => {
    return orders.filter(order => 
      order.customerEmail === customers.find(c => c.id === customerId)?.email
    );
  };

  const getSegmentBadge = (segment) => {
    switch (segment.toLowerCase()) {
      case "premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case "standard":
        return <Badge className="bg-blue-100 text-blue-800">Standard</Badge>;
      case "basic":
        return <Badge className="bg-gray-100 text-gray-800">Basic</Badge>;
      default:
        return <Badge variant="secondary">{segment}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Pasif</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Müşteri Yönetimi</h2>
          <p className="text-gray-600">Shopify müşterilerini görüntüle ve yönet</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Yeni Müşteri
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri ara (isim, email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Segment filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Segmentler</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama LTV</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Müşteri</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium Müşteri</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.segment === "Premium").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
          <CardDescription>
            {filteredCustomers.length} müşteri gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Müşteri</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Sipariş Sayısı</TableHead>
                <TableHead>Toplam Harcama</TableHead>
                <TableHead>Son Sipariş</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{getSegmentBadge(customer.segment)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.ordersCount}</div>
                    <div className="text-sm text-gray-500">
                      Ort: {formatCurrency(customer.avgOrderValue)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(customer.lastOrderDate)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detayları Gör
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          E-posta Gönder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
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

      {/* Customer Detail Modal */}
      <Dialog open={showCustomerDetail} onOpenChange={setShowCustomerDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </DialogTitle>
                <DialogDescription>
                  Müşteri detayları ve sipariş geçmişi
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                  <TabsTrigger value="orders">Siparişler</TabsTrigger>
                  <TabsTrigger value="analytics">Analitik</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          İletişim Bilgileri
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedCustomer.email}</span>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{selectedCustomer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>İlk sipariş: {formatDate(selectedCustomer.firstOrderDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSegmentBadge(selectedCustomer.segment)}
                          {getStatusBadge(selectedCustomer.status)}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Varsayılan Adres
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          <div>{selectedCustomer.defaultAddress.address1}</div>
                          <div>
                            {selectedCustomer.defaultAddress.city}, {selectedCustomer.defaultAddress.province}
                          </div>
                          <div>
                            {selectedCustomer.defaultAddress.country} {selectedCustomer.defaultAddress.zip}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedCustomer.ordersCount}</div>
                          <div className="text-sm text-gray-600">Toplam Sipariş</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {formatCurrency(selectedCustomer.totalSpent)}
                          </div>
                          <div className="text-sm text-gray-600">Toplam Harcama</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {formatCurrency(selectedCustomer.avgOrderValue)}
                          </div>
                          <div className="text-sm text-gray-600">Ortalama Sipariş</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {formatCurrency(selectedCustomer.lifetimeValue)}
                          </div>
                          <div className="text-sm text-gray-600">LTV</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sipariş Geçmişi</CardTitle>
                      <CardDescription>
                        Bu müşteriye ait tüm siparişler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getCustomerOrders(selectedCustomer.id).map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold">{order.orderNumber}</div>
                              <div className="text-sm text-gray-600">
                                {formatDate(order.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                {order.lineItems.length} ürün
                              </div>
                              <div className="font-medium">
                                {formatCurrency(order.totalPrice, order.currency)}
                              </div>
                            </div>
                          </div>
                        ))}
                        {getCustomerOrders(selectedCustomer.id).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            Henüz sipariş bulunmuyor
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Müşteri Analitikleri</CardTitle>
                      <CardDescription>
                        Satın alma davranışları ve trendler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        Analitik veriler yakında gelecek...
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}