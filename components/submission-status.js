import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Başarılı form gönderimi komponenti
 */
export const SubmissionSuccess = ({ onClose, result }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Teklif Talebiniz Başarıyla Gönderildi!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Talebiniz alındı ve uzman ekibimiz değerlendirmeye aldı. En kısa
          sürede size dönüş yapacağız.
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
        <Clock className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Süreç Hakkında:</strong> Teklif hazırlama süremiz genellikle
          24-48 saat arasındadır. Karmaşık projeler için bu süre 72 saat kadar
          çıkabilir.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Sonraki Adımlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                1
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Talep Değerlendirme
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Uzman ekibimiz talebinizi detaylı olarak inceliyor.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                2
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Teklif Hazırlama
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Size özel detaylı teklif ve fiyat hesaplaması yapılıyor.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                3
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Size Ulaşıyoruz
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                E-posta ve telefon ile size detaylı teklifi sunuyoruz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Acil Durumlarda İletişim
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="text-gray-900 dark:text-gray-100">
              +90 531 494 25 94
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-blue-600" />
            <span className="text-gray-900 dark:text-gray-100">
              fason@mkngroup.com.tr
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={onClose} className="flex-1" variant="outline">
          Ana Sayfaya Dön
        </Button>
        <Button
          onClick={() => (window.location.href = "/fason-uretim")}
          className="flex-1"
        >
          Fason Üretim Hakkında
        </Button>
      </div>

      {result?.docId && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Referans No:{" "}
            <span className="font-mono">
              {result.docId.slice(-8).toUpperCase()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Form gönderim hatası komponenti
 */
export const SubmissionError = ({ onRetry, onClose, result }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gönderim Başarısız
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Teklif talebiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
        </p>
      </div>

      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>Hata:</strong>{" "}
          {result?.message || "Bilinmeyen bir hata oluştu"}
        </AlertDescription>
      </Alert>

      {result?.errors && Object.keys(result.errors).length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-lg text-red-900 dark:text-red-100">
              Düzeltilmesi Gereken Alanlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(result.errors).map(([field, error]) => (
                <li key={field} className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Alternatif İletişim Yolları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Eğer sorun devam ederse, aşağıdaki kanallardan doğrudan iletişime
            geçebilirsiniz:
          </p>
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="text-gray-900 dark:text-gray-100">
              +90 216 XXX XX XX
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-blue-600" />
            <span className="text-gray-900 dark:text-gray-100">
              fason@mkngroup.com.tr
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={onRetry} className="flex-1" variant="outline">
          Tekrar Dene
        </Button>
        <Button onClick={onClose} className="flex-1">
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
};

/**
 * Form gönderim loading komponenti
 */
export const SubmissionLoading = () => {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Teklif Talebiniz Gönderiliyor...
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Lütfen bekleyin, talebiniz işleniyor.
      </p>

      <div className="space-y-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bu işlem birkaç saniye sürebilir...
        </p>
      </div>
    </div>
  );
};
