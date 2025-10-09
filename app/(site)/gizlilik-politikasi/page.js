import { SEOHead } from "@/components/seo-head";

export const metadata = {
  title: "Gizlilik Politikası | MKN Group",
  description: "MKN Group kişisel verilerin korunması ve gizlilik politikası",
  robots: "noindex, nofollow",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead
        title="Gizlilik Politikası | MKN Group"
        description="MKN Group kişisel verilerin korunması ve gizlilik politikası"
        canonical="https://www.mkngroup.com.tr/gizlilik-politikasi"
      />

      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Gizlilik Politikası
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                <strong>MKN Group</strong> olarak, kişisel verilerinizin
                güvenliği ve gizliliği bizim için öncelikli bir konudur. Bu
                politika, kişisel verilerinizin nasıl toplandığını,
                kullanıldığını ve korunduğunu açıklar.
              </p>
            </div>

            <h2>1. Veri Sorumlusu</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-8 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MKN</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    MKN Group
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Veri Sorumlusu
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Genel İletişim
                  </h4>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">📧</span>
                      <span>info@mkngroup.com.tr</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">📞</span>
                      <span>+90 531 494 25 94</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">🌐</span>
                      <span>mkngroup.com.tr</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Adres
                  </h4>
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 mt-1">📍</span>
                    <span>
                      Akçaburgaz Mah, 3026 Sk, No:5
                      <br />
                      Esenyurt, İstanbul, Türkiye
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h2>2. Toplanan Kişisel Veriler</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Web sitemizi ziyaret ettiğinizde ve hizmetlerimizden
              yararlandığınızda aşağıdaki kişisel veriler toplanabilir:
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
                  <span>👤</span> Kimlik Bilgileri
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Ad ve soyad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>E-posta adresi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Telefon numarası</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Şirket adı</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span>📞</span> İletişim Bilgileri
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>E-posta adresi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Telefon numarası</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Posta adresi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Şirket bilgileri</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <span>💻</span> Teknik Veriler
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>IP adresi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Tarayıcı bilgileri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Ziyaret verileri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Çerezler</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2>3. Kişisel Verilerin Toplanma Yöntemleri</h2>
            <p>Kişisel verileriniz aşağıdaki yollarla toplanmaktadır:</p>
            <ul>
              <li>İletişim formları aracılığıyla</li>
              <li>E-posta abonelikleri</li>
              <li>Teklif talep formları</li>
              <li>İş başvuru formları</li>
              <li>Web sitesi çerezleri</li>
              <li>Analitik araçlar (Google Analytics vb.)</li>
            </ul>

            <h2>4. Kişisel Verilerin İşlenme Amaçları</h2>
            <p>Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
            <ul>
              <li>Müşteri hizmetleri ve destek sağlama</li>
              <li>Ürün ve hizmet teklifleri sunma</li>
              <li>İş başvurularını değerlendirme</li>
              <li>Yasal yükümlülükleri yerine getirme</li>
              <li>Web sitesi performansını iyileştirme</li>
              <li>Pazarlama faaliyetleri (rıza dahilinde)</li>
              <li>İstatistiksel analizler yapma</li>
            </ul>

            <h2>5. Kişisel Verilerin İşlenme Hukuki Dayanakları</h2>
            <p>
              Kişisel verileriniz aşağıdaki hukuki dayanaklara göre
              işlenmektedir:
            </p>
            <ul>
              <li>
                <strong>Açık rıza:</strong> E-posta abonelikleri, pazarlama
                iletişimi
              </li>
              <li>
                <strong>Sözleşme:</strong> Hizmet sağlama, müşteri ilişkileri
              </li>
              <li>
                <strong>Yasal yükümlülük:</strong> Muhasebe kayıtları, vergi
                beyannameleri
              </li>
              <li>
                <strong>Meşru menfaat:</strong> Web sitesi güvenliği, analitik
              </li>
            </ul>

            <h2>6. Kişisel Verilerin Paylaşılması</h2>
            <p>
              Kişisel verileriniz aşağıdaki durumlarda üçüncü taraflarla
              paylaşılabilir:
            </p>
            <ul>
              <li>Yasal zorunluluklar çerçevesinde kamu kurumları ile</li>
              <li>
                Hizmet sağlayıcılarımız (hosting, analitik, e-posta servisleri)
              </li>
              <li>
                İş ortaklarımız (sadece gerekli durumlarda ve sınırlı olarak)
              </li>
              <li>Açık rızanızın bulunduğu durumlar</li>
            </ul>

            <h2>7. Kişisel Verilerin Saklanma Süresi</h2>
            <p>Kişisel verileriniz aşağıdaki süreler boyunca saklanmaktadır:</p>
            <ul>
              <li>
                <strong>İletişim verileri:</strong> 3 yıl
              </li>
              <li>
                <strong>Müşteri verileri:</strong> Sözleşme süresi + 10 yıl
              </li>
              <li>
                <strong>İş başvuru verileri:</strong> 1 yıl
              </li>
              <li>
                <strong>Web sitesi logları:</strong> 1 yıl
              </li>
              <li>
                <strong>Pazarlama verileri:</strong> Rıza geri alınana kadar
              </li>
            </ul>

            <h2>8. Çerezler (Cookies)</h2>
            <p>Web sitemiz aşağıdaki çerez türlerini kullanmaktadır:</p>

            <h3>8.1 Gerekli Çerezler</h3>
            <p>
              Web sitesinin temel işlevlerini yerine getirmesi için gerekli olan
              çerezler.
            </p>

            <h3>8.2 Analitik Çerezler</h3>
            <p>
              Google Analytics gibi araçlarla web sitesi performansını analiz
              etmek için kullanılır.
            </p>

            <h3>8.3 Pazarlama Çerezleri</h3>
            <p>
              Kişiselleştirilmiş reklam ve pazarlama içerikleri sunmak için
              kullanılır.
            </p>

            <h2>9. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizin güvenliği için aşağıdaki önlemleri
              almaktayız:
            </p>
            <ul>
              <li>SSL sertifikası ile şifreli veri iletimi</li>
              <li>Güvenli sunucu altyapısı</li>
              <li>Düzenli güvenlik güncellemeleri</li>
              <li>Erişim kontrolü ve yetkilendirme</li>
              <li>Veri yedekleme ve kurtarma prosedürleri</li>
              <li>Personel eğitimleri ve gizlilik anlaşmaları</li>
            </ul>

            <h2>10. Veri Sahibinin Hakları</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>
                <strong>Bilgi alma hakkı:</strong> Verilerinizin işlenip
                işlenmediğini öğrenme
              </li>
              <li>
                <strong>Erişim hakkı:</strong> İşlenen verilerinizi talep etme
              </li>
              <li>
                <strong>Düzeltme hakkı:</strong> Yanlış verilerin düzeltilmesini
                isteme
              </li>
              <li>
                <strong>Silme hakkı:</strong> Verilerinizin silinmesini talep
                etme
              </li>
              <li>
                <strong>İtiraz hakkı:</strong> Veri işlemeye itiraz etme
              </li>
              <li>
                <strong>Taşınabilirlik hakkı:</strong> Verilerinizi başka
                platforma aktarma
              </li>
            </ul>

            <h2>11. Hakların Kullanılması</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Veri sahibi haklarınızı kullanmak için aşağıdaki yollarla
              başvurabilirsiniz:
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-8">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <span>📋</span> Başvuru Yolları
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                    <span className="text-2xl">📧</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        E-posta
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        kvkk@mkngroup.com.tr
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Telefon
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        +90 531 494 25 94
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Online Başvuru
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Web sitemizdeki KVKK formu
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                    <span className="text-2xl">📬</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Posta
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Yazılı başvuru
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2>12. Veri İhlali Bildirimi</h2>
            <p>
              Kişisel verilerin güvenliğini etkileyen herhangi bir ihlal
              durumunda, yasal süreler içerisinde Kişisel Verileri Koruma
              Kurulu'na bildirim yapılacak ve veri sahipleri
              bilgilendirilecektir.
            </p>

            <h2>13. Uluslararası Veri Transferi</h2>
            <p>
              Kişisel verileriniz, yeterli koruma seviyesine sahip ülkelere veya
              uygun güvenceler sağlanarak aktarılabilir. Bu durumda KVKK'nın
              ilgili hükümleri uygulanacaktır.
            </p>

            <h2>14. Otomatik Karar Verme</h2>
            <p>
              Web sitemizde otomatik karar verme sistemleri kullanılmamaktadır.
              Tüm değerlendirmeler insan müdahalesi ile yapılmaktadır.
            </p>

            <h2>15. Politika Değişiklikleri</h2>
            <p>
              Bu gizlilik politikası, yasal gereksinimlere uyum sağlamak veya
              hizmetlerimizi iyileştirmek amacıyla güncellenebilir. Önemli
              değişiklikler web sitesinde duyurulacak ve gerekirse e-posta ile
              bilgilendirileceksiniz.
            </p>

            <h2>16. İletişim</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Bu gizlilik politikası hakkında sorularınız için bizimle iletişime
              geçebilirsiniz:
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mt-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MKN</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    MKN Group
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Veri Sorumlusu
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    İletişim Bilgileri
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-blue-500">📧</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Genel
                        </div>
                        <div className="font-medium">info@mkngroup.com.tr</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-blue-500">📧</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          KVKK
                        </div>
                        <div className="font-medium">kvkk@mkngroup.com.tr</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-blue-500">📞</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Telefon
                        </div>
                        <div className="font-medium">+90 531 494 25 94</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Adres Bilgileri
                  </h4>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">📍</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Genel Merkez
                        </div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          Akçaburgaz Mah, 3026 Sk, No:5
                          <br />
                          Esenyurt, İstanbul, Türkiye
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold mb-2">⚠️ Önemli Not</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                Bu gizlilik politikası 6698 sayılı Kişisel Verilerin Korunması
                Kanunu ve GDPR gereksinimlerine uygun olarak hazırlanmıştır.
                Kişisel verilerinizin korunması konusunda yasal haklarınızı
                kullanmaktan çekinmeyiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
