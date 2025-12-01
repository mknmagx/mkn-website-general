/**
 * Sözleşme Şablonları
 * Türkiye yasalarına uygun profesyonel sözleşme şablonları
 */

export const CONTRACT_TYPES = {
  FASON_URETIM: "fason_uretim",
  FASON_KOZMETIK: "fason_kozmetik",
  FASON_GIDA: "fason_gida",
  FASON_TEMIZLIK: "fason_temizlik",
  FULFILLMENT: "fulfillment",
  AMBALAJ: "ambalaj",
  LOJISTIK: "lojistik",
  GENEL: "genel",
};

export const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPES.FASON_URETIM]: "Fason Üretim Sözleşmesi (Genel)",
  [CONTRACT_TYPES.FASON_KOZMETIK]: "Fason Kozmetik Üretim Sözleşmesi",
  [CONTRACT_TYPES.FASON_GIDA]: "Fason Gıda Üretim Sözleşmesi",
  [CONTRACT_TYPES.FASON_TEMIZLIK]: "Fason Temizlik Ürünleri Üretim Sözleşmesi",
  [CONTRACT_TYPES.FULFILLMENT]: "E-ticaret Fulfillment Hizmet Sözleşmesi",
  [CONTRACT_TYPES.AMBALAJ]: "Ambalaj Tedarik ve Hizmet Sözleşmesi",
  [CONTRACT_TYPES.LOJISTIK]: "Lojistik ve Depolama Hizmet Sözleşmesi",
  [CONTRACT_TYPES.GENEL]: "Genel Hizmet Sözleşmesi",
};

export const CONTRACT_TEMPLATES = {
  [CONTRACT_TYPES.FASON_URETIM]: {
    title: "FASON ÜRETİM SÖZLEŞMESİ",
    content: `

Madde 1 – Taraflar
İşbu Fason Üretim Sözleşmesi ("Sözleşme"); aşağıda bilgileri yer alan taraflar arasında akdedilmiştir.

1.1. MKNGROUP ({{mkngroup_unvan}})
Adres   : {{mkngroup_adres}}
Vergi Dairesi / No : {{mkngroup_vergi_dairesi}} / {{mkngroup_vergi_no}}
MERSİS No : {{mkngroup_mersis}}
E-posta : {{mkngroup_email}}
Tel     : {{mkngroup_telefon}}

1.2. MÜŞTERİ: {{musteri_firma}}
Adres   : {{musteri_adres}}
Vergi Dairesi / No : {{musteri_vergi_dairesi}} / {{musteri_vergi_no}}
MERSİS / Kayıt No : {{musteri_mersis}}
E-posta : {{musteri_email}}
Tel     : {{musteri_telefon}}

1.3. Üretimin yapılacağı anlaşmalı tesis: {{uretim_tesisi}} olup, MÜŞTERİ, üretimin bu tesiste veya MKNGROUP tarafından yazılı olarak bildirilecek eşdeğer nitelikteki başka bir tesiste gerçekleştirileceğini kabul eder. İşbu Sözleşme bakımından sözleşmesel muhatap MKNGROUP'tur.

Madde 2 – Tanımlar
2.1. Ürün/Ürünler: İşbu Sözleşme uyarınca MKNGROUP tarafından MÜŞTERİ adına üretimi organize edilen kozmetik, gıda takviyesi, temizlik ürünü vb. ürünleri ifade eder.
2.2. Formül/Formülasyon: Ürünün bileşimi, içerik yüzdeleri, hammaddeler ve üretim prosesini içeren teknik dokümanı ifade eder.
2.3. Teknik Dosya: Ürün spesifikasyonu, üretim prosesi, ham madde ve bitmiş ürün analizleri, MSDS, COA, stabilite vb. teknik belgelerin tümünü ifade eder.
2.4. Taraflar: MKNGROUP ve MÜŞTERİ; tek tek "Taraf", birlikte "Taraflar" olarak anılır.

Madde 3 – Sözleşmenin Konusu
3.1. İşbu Sözleşmenin konusu; MÜŞTERİ'ye ait veya MÜŞTERİ adına geliştirilecek Ürünler'in, MKNGROUP organizasyonunda {{uretim_tesisi}} üretim tesisinde fason olarak üretilmesi, ambalajlanması ve MÜŞTERİ'ye teslimine ilişkin Tarafların hak ve yükümlülüklerinin belirlenmesidir.
3.2. Ürünlere ilişkin adet, birim fiyat ve toplam bedeller, her sipariş öncesinde Taraflarca onaylanan ve işbu Sözleşmenin ayrılmaz parçası olan proforma fatura(lar)da yer alır. Proformada belirtilen ticari koşullar, bu Sözleşme hükümleri saklı kalmak kaydıyla uygulanır.

Madde 4 – Tarafların Rollerinin Tanımı
4.1. MKNGROUP; MÜŞTERİ'den gelen talep doğrultusunda formül geliştirme, numune hazırlanması, tekliflendirme, üretim planlaması ve üretim tesisi nezdindeki üretim sürecinin koordinasyonundan sorumludur.
4.2. Üretim Tesisi; kendi tesisinde, yürürlükteki mevzuata ve GMP/kalite standartlarına uygun şekilde üretimin fiilen gerçekleştirilmesinden sorumludur.
4.3. MÜŞTERİ; ürün konseptinin belirlenmesi, marka, etiket tasarımı ve beyanları, yasal bildirim ve kayıtların MÜŞTERİ adına yapılması, ürünlerin pazarlanması ve satışından sorumludur.
4.4. MKNGROUP, operasyonel sebeplerle üretim tesisini değiştirme hakkını saklı tutar. Bu değişiklik MÜŞTERİ'ye yazılı olarak bildirilir; yeni tesis de asgari GMP/kalite standartlarını sağlayacaktır.

Madde 5 – Ürün Formülü, Geliştirme ve Mülkiyet
5.1. Ürün formülü; MÜŞTERİ tarafından sağlanabilir veya MKNGROUP/Üretim Tesisi tarafından MÜŞTERİ'ye özel geliştirilebilir.
5.2. Formül üzerinde mutabakat sağlandıktan sonra MKNGROUP deneme üretimi/numune hazırlayarak MÜŞTERİ onayına sunar. MÜŞTERİ'nin yazılı/on-line yazılı onayı olmadan seri üretime geçilmez.
5.3. İşbu Sözleşme kapsamında geliştirilen ve/veya kullanılan nihai ürün formülü, üretim sonrası MÜŞTERİ'ye teslim edilir ve formül üzerindeki kullanım hakkı MÜŞTERİ'ye ait olur. MKNGROUP ve Üretim Tesisi, MÜŞTERİ'nin yazılı izni olmaksızın aynı formülü veya ayırt edilemeyecek derecede benzerini üçüncü kişiler için kullanmayacağını kabul eder.
5.4. Formülde yapılacak her değişiklik, yazılı (e-posta dahil) olarak Taraflarca onaylanır ve ilgili maliyet/fiyat etkisi ayrıca belirlenir.

Madde 5A – Pilot Ürün Numunesi{{pilot_numune_aktif}}
5A.1. Pilot ürün numunesi üretimi gerçekleşeceği taktirde ücretsiz olarak MÜŞTERİ'ye sunulacaktır.
5A.2. Ancak, numune talebinden sonra MÜŞTERİ'nin üretimi iptal etmesi durumunda; hazırlanan her numune için {{pilot_numune_fiyat}} TL müşteriye fatura edilecektir.
5A.3. İşbu madde hükmü; yalnızca MÜŞTERİ'nin onay verdiği formülasyon kapsamındaki numuneler için geçerlidir. Talep edilen farklı formülasyon denemeleri için ayrı fiyatlandırma yapılabilir.{{/pilot_numune_aktif}}

Madde 6 – Kalite ve Teknik Dokümanlar
6.1. Üretim, Üretim Tesisi'nin güncel GMP ve ilgili mevzuatı doğrultusunda uyguladığı prosedürlere göre yapılır.
6.2. Her lot/batch için Üretim Tesisi'nin belirlediği zorunlu analiz ve kalite kontrolleri yapılır. MÜŞTERİ'nin talep ettiği ilave analizler ayrıca fiyatlandırılır.
6.3. MÜŞTERİ, makul süre önce haber vermek kaydıyla üretim tesisinde denetim/audit yapma hakkına sahiptir. Audit kapsamı, zamanı ve süresi Taraflarca önceden yazılı olarak netleştirilir.
6.4. MKNGROUP, MÜŞTERİ'nin talebi halinde ve yürürlükteki mevzuat el verdiği ölçüde, ürün için gerekli teknik dosya içeriklerini sağlayacaktır. Belge kapsamı ve bedeli ayrıca kararlaştırılabilir.

Madde 7 – Hammadde ve Ambalaj
7.1. Aksi yazılı olarak kararlaştırılmadıkça; tüm hammaddeler ile birincil ve ikincil ambalajlar MKNGROUP tarafından tedarik edilir ve ilgili proforma faturalarda belirtilen fiyatlara dahildir.
7.2. MÜŞTERİ tarafından sağlanan hammadde veya ambalaj olması halinde; kalite, uygunluk ve mevzuata uyum sorumluluğu MÜŞTERİ'ye aittir. Tesiste yapılacak kontrollerde uygunsuzluk tespit edilmesi halinde üretim durdurulabilir ve doğabilecek ek maliyetler MÜŞTERİ'ye yansıtılır.
7.3. Hammadde ve ambalaj fiyatları, global piyasa koşulları, döviz kurları ve tedarikçi fiyatlarına bağlı olarak değişebilir. MKNGROUP, makul gerekçe ve bildirimle fiyat revizyonu yapma hakkını saklı tutar.

Madde 8 – Sipariş, Üretim Planlama ve Teslimat
8.1. MÜŞTERİ, her üretim için yazılı sipariş (e-posta vb.) verir. Siparişte; ürün adı, ambalaj hacmi, adet, istenen teslim tarihi ve özel talepler açıkça belirtilir.
8.2. Her ürün için asgari üretim adedi (MOQ), ilgili proforma faturalarda belirtilir. MOQ altında kalan siparişler için ek maliyet veya siparişin reddi hakkı MKNGROUP'a aittir.
8.3. Standart üretim termin süresi, tüm onayların tamamlanıp siparişin MKNGROUP tarafından yazılı olarak teyidinden itibaren {{teslimat_suresi}} iş günü olup; hammadde/ambalaj tedarik süresi, resmi tatiller, mücbir sebepler ve olağanüstü haller bu süreye dahil değildir.
8.4. Teslim şekli kural olarak {{teslim_sekli}} (Incoterms'in güncel versiyonu) olup, nakliye, sigorta ve gümrük işlemleri koşullara göre belirlenir. Taraflar farklı bir teslim şekli kararlaştırırsa, ilave maliyetler ayrıca fiyatlandırılır.
8.5. Teslim sırasında MÜŞTERİ veya yetkili temsilcisi; koli adedi, görünür hasar, ambalaj bütünlüğü gibi hususları kontrol eder ve varsa tespitlerini derhal yazılı olarak tutanak altına alır. Aksi halde, ürünler dış hasar açısından eksiksiz teslim edilmiş sayılır.

Madde 9 – Fiyatlandırma ve Ödeme Koşulları
9.1. Ürün birim fiyatları, para birimi ve toplam bedeller, ilgili proforma faturada yer alır. Fiyatlar kural olarak EXW fabrika teslim fiyat olup, KDV hariçtir. KDV ve diğer yasal yükümlülükler MÜŞTERİ'ye aittir.
9.2. Ödeme; MKNGROUP tarafından bildirilecek banka hesaplarına havale/EFT yoluyla yapılır.
9.3. Taraflar, ödeme planında aşağıdaki şekilde mutabık kalmıştır:
   (a) Siparişin kesinleşmesi ve üretim planına alınması için ilgili proforma fatura toplam bedelinin %{{avans_orani}} peşin (avans) olarak ödenir.
   (b) Kalan %{{bakiye_orani}} bakiye, ürünlerin MKNGROUP tarafından MÜŞTERİ'ye teslimi ({{teslim_sekli}}) aşamasında ve sevkiyat öncesinde ödenir.
9.4. Ödemelerin vadesi ve banka hesap bilgileri, ilgili proforma faturada belirtilecektir.
9.5. Sevkiyat öncesi bakiye ödemenin yapılmaması halinde, ürünler sevkiyata çıkarılmaz. Bu gecikmeden doğacak tüm ilave masraflar (depolama, finansman, operasyonel kayıplar) MÜŞTERİ'ye aittir.
9.6. Vadesinde ödenmeyen bedeller için, fatura/proforma üzerinde belirtilen vadeden itibaren Türk Borçlar Kanunu'na uygun yasal temerrüt faizi uygulanır.

{{odeme_guvence_aktif}}
Madde 9A – Ödeme Gecikmesi ve Yaptırımlar
9A.1. Ödeme planına uygun olarak yapılmayan ödemelerde MKNGROUP, mevcut siparişi durdurma, üretim sürecini askıya alma ve yeni sipariş kabul etmeme hakkına sahiptir.
9A.2. Ödeme gecikmesi {{odeme_gecikme_gun}} ({{odeme_gecikme_gun}}) günü aşması halinde:
   (a) Devam eden üretim süreci askıya alınabilir,
   (b) Yeni sipariş ve üretim talebi kabul edilmeyebilir,
   (c) İlgili siparişe ait planlanmış üretim kapasitesi başka müşterilere tahsis edilebilir.
9A.3. Ödeme gecikmesi {{odeme_iptal_gun}} ({{odeme_iptal_gun}}) günü aşması halinde:
   (a) Sipariş iptal edilmiş sayılır,
   (b) O ana kadar yapılan üretim, kullanılan hammadde, ambalaj ve işçilik maliyetleri MÜŞTERİ'den tahsil edilir,
   (c) Ödenen avans iade edilmez ve mevcut borç tahsiline mahsup edilir,
   (d) MKNGROUP, MÜŞTERİ'nin diğer siparişlerini de askıya alma veya iptal etme hakkını saklı tutar.
9A.4. Tamamlanmış ancak teslim edilmemiş ürünler için, gecikme süresi boyunca günlük depolama ücreti (parti değerinin %{{depolama_ucret_orani}}/gün) uygulanır.

Madde 9B – Tahsilat Koruma ve Hukuki Haklar
9B.1. Ödeme gecikmesi {{odeme_iptal_gun}} günü geçtiğinde, MKNGROUP teslim edilmemiş ürünleri üçüncü kişilere satma veya kendi bünyesinde kullanma hakkını korur; ancak bu durumda:
   (a) Üretim, hammadde, işçilik ve stok maliyetleri,
   (b) Depolama ücretleri ve operasyonel kayıplar,
   (c) Finansal zarar ve fırsat maliyeti,
   tamamen MÜŞTERİ'den tahsil edilir ve avans iade edilmez.
9B.2. MKNGROUP, ürünleri satması durumunda elde edilen geliri öncelikle kendi alacağına mahsup eder; arta kalan tutar varsa MÜŞTERİ'ye iade edilir.
9B.3. Ödeme temerrüdü devam ettiği sürece, MKNGROUP yasal takip başlatma (icra, haciz, dava vb.) hakkını saklı tutar. Yasal takip masrafları ve avukatlık ücretleri MÜŞTERİ'ye aittir.
9B.4. MÜŞTERİ'nin ödeme temerrüdünün 60 günü aşması veya tekrarlayan ödeme gecikmeleri olması halinde, MKNGROUP işbu Sözleşmeyi tek taraflı olarak feshedebilir ve tüm alacaklarını talep edebilir.
{{/odeme_guvence_aktif}}

Madde 10 – Yasal Sorumluluklar, UTS ve Bakanlık İşlemleri
10.1. Ürünlerin pazarlanması, reklamları, etiket ve ambalaj beyanları ile ilgili tüm hukuki sorumluluk kural olarak MÜŞTERİ'ye aittir.
10.2. Kozmetik, gıda takviyesi, temizlik ürünü vb. ürünler için gerekli tüm Bakanlık kayıtları, bildirimleri, UTS işlemleri, ruhsatlar ve izinler MÜŞTERİ'nin kendi şirketi tarafından yapılacak olup, bu işlemler ve ilgili yasal sorumluluk tamamen MÜŞTERİ'ye aittir.
10.3. MKNGROUP, talep edilmesi halinde bu süreçlerde teknik bilgi ve rehberlik sağlayabilir; ancak yasal başvuru sahibi ve sorumlu taraf MÜŞTERİ'dir.
10.4. MÜŞTERİ, ürünlerin hedef pazarlarında yürürlükteki tüm mevzuata uygun şekilde satışını sağlamakla yükümlüdür.

Madde 11 – Ayıplı Ürün, İade ve Geri Çağırma
11.1. MÜŞTERİ, teslim aldığı ürünleri makul süre içinde (en geç teslimden itibaren 15 gün) kontrol eder. Üründe gizli veya açık ayıp tespit edilmesi halinde, durumu derhal yazılı olarak MKNGROUP'a bildirir.
11.2. Yapılacak incelemede ayıbın üretim prosesinden veya MKNGROUP/Üretim Tesisi'nin kusurundan kaynaklandığının tespiti halinde, MKNGROUP'un sorumluluğu; MÜŞTERİ'nin seçimine göre, ayıplı partinin ücretsiz yeniden üretilmesi veya ödenen üretim bedelinin iadesi ile sınırlıdır.
11.3. Ayıbın; MÜŞTERİ tarafından sağlanan hammadde/ambalaj, hatalı depolama, taşıma veya MÜŞTERİ'nin yanlış kullanım talimatlarından kaynaklanması halinde, MKNGROUP sorumlu tutulamaz.
11.4. Herhangi bir otorite tarafından ürün geri çağırma kararı verilmesi veya MÜŞTERİ'nin kendi inisiyatifiyle geri çağırma yapması halinde; geri çağırmanın sebebine göre mali yükümlülükler Tarafların kusurları oranında belirlenecektir.

Madde 12 – Fikri Mülkiyet Hakları ve Markalar
12.1. MÜŞTERİ'nin marka, tasarım, logo, etiket, ambalaj tasarımı üzerindeki tüm fikri haklar MÜŞTERİ'ye aittir. MKNGROUP bu unsurları yalnızca Sözleşme kapsamındaki üretim ve tanıtım faaliyetlerinde kullanabilir.
12.2. İşbu Sözleşme kapsamında geliştirilen nihai ürün formülü MÜŞTERİ'ye aittir. MKNGROUP ve Üretim Tesisi, MÜŞTERİ'nin yazılı izni olmaksızın aynı veya ayırt edilemeyecek derecede benzer formülü üçüncü kişiler için kullanmayacağını taahhüt eder.
12.3. Taraflar, birbirlerinin ticari unvan ve markalarını referans olarak kullanmak için karşılıklı yazılı/on-line onay alacaklardır.

Madde 13 – Gizlilik
13.1. Taraflar; Sözleşme kapsamında öğrendikleri teknik, ticari, mali tüm bilgi ve belgeleri gizli bilgi kabul eder ve üçüncü kişilere açıklamazlar.
13.2. Gizlilik yükümlülüğü, Sözleşmenin herhangi bir nedenle sona ermesinden sonra dahi {{gizlilik_suresi}} yıl süreyle devam eder.
13.3. Yasal zorunluluk gereği ilgili mercilere bilgi verilmesi gereken hallerde; Taraflar, mümkün olduğu ölçüde birbirlerini önceden bilgilendirecektir.

Madde 14 – Sözleşmenin Süresi ve Feshi
14.1. İşbu Sözleşme, {{baslangic_tarihi}} tarihinde yürürlüğe girer ve {{sozlesme_suresi}} yıl süreyle geçerlidir. Süre sonunda Tarafların yazılı mutabakatı ile uzatılabilir.
14.2. Taraflardan herhangi biri, Sözleşme hükümlerine aykırılığın yazılı bildirimden itibaren 30 (otuz) gün içerisinde giderilmemesi halinde, Sözleşmeyi haklı nedenle feshedebilir.
14.3. MÜŞTERİ'nin iflası, konkordato ilanı veya ödemelerini tatil etmesi halinde; MKNGROUP, Sözleşmeyi derhal feshedebilir ve muaccel hale gelen alacaklarını talep eder.
14.4. Fesih; yürürlükteki siparişler üzerindeki etkisi, alacak-borç durumu ve stokların akıbeti yönünden Taraflarca iyi niyet çerçevesinde ayrıca protokole bağlanır.

Madde 15 – Mücbir Sebep
15.1. Tarafların kontrolü dışında gelişen; doğal afet, savaş, terör eylemleri, grev, lokavt, salgın hastalık, resmi makam kararları, tedarik zinciri kesintileri, enerji kesintileri vb. mücbir sebep hallerinde, etkilenen Taraf yükümlülüklerini yerine getirememesinden sorumlu tutulamaz.
15.2. Mücbir sebep halinin 60 (altmış) günden fazla sürmesi halinde, Taraflardan her biri Sözleşmeyi tazminatsız feshetme hakkına sahip olacaktır.

Madde 16 – Bildirimler
16.1. Taraflar arasında yapılacak tüm bildirimler; işbu Sözleşmede belirtilen adreslere ve e-posta adreslerine gönderilecek yazılı bildirimler üzerinden yapılacaktır.
16.2. E-posta ile yapılan bildirimler, gönderim kayıtları esas alınarak yazılı bildirim hükmündedir.

Madde 17 – Uygulanacak Hukuk ve Yetkili Mahkeme
17.1. İşbu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir.
17.2. Sözleşmeden doğan uyuşmazlıkların çözümünde {{yetkili_mahkeme}} yetkilidir.

Madde 18 – Yürürlük ve İmza
18.1. İşbu Sözleşme, Taraflarca okunup anlaşılarak, her sayfası paraf edilmek suretiyle imzalanmış ve yürürlüğe girmiştir.

Tarih: {{imza_tarihi}}

[SIGNATURE_SECTION]
MKNGROUP MÜŞTERİ
{{mkngroup_yetkili}} {{musteri_yetkili_imza}}
{{mkngroup_gorev}} {{musteri_gorev}}
[/SIGNATURE_SECTION]
    `,
    fields: [
      {
        name: "mkngroup_unvan",
        label: "Şirket Ticari Ünvanı",
        type: "text",
        required: true,
        default:
          "TONGZİ BERTUG MULTİNATİONAL MEDİKAL ÜRÜNLER OTOMOTİV SANAYİ VE DIŞ TİCARET LİMİTED ŞİRKETİ",
        readonly: true,
      },
      {
        name: "mkngroup_adres",
        label: "MKNGROUP Adres",
        type: "textarea",
        required: true,
        default: "Yakuplu Mah. Dereboyu Cad. No: 4/1 Beylikdüzü / İSTANBUL",
        readonly: true,
      },
      {
        name: "mkngroup_vergi_dairesi",
        label: "MKNGROUP Vergi Dairesi",
        type: "text",
        required: true,
        default: "Beylikdüzü",
      },
      {
        name: "mkngroup_vergi_no",
        label: "MKNGROUP Vergi No",
        type: "text",
        required: true,
        default: "8500737362",
      },
      {
        name: "mkngroup_mersis",
        label: "MKNGROUP MERSİS No",
        type: "text",
        required: false,
        default: "0123456789012345",
      },
      {
        name: "mkngroup_email",
        label: "MKNGROUP E-posta",
        type: "text",
        required: true,
        default: "info@mkngroup.com.tr",
        readonly: true,
      },
      {
        name: "mkngroup_telefon",
        label: "MKNGROUP Telefon",
        type: "text",
        required: true,
        default: "+90 531 494 25 94",
        readonly: true,
      },
      {
        name: "uretim_tesisi",
        label: "Üretici Firma Adı",
        type: "text",
        required: false,
        default: "",
      },
      {
        name: "uretici_adres",
        label: "Üretici Firma Adresi",
        type: "textarea",
        required: false,
      },
      {
        name: "uretici_yetkili",
        label: "Üretici Firma Yetkilisi",
        type: "text",
        required: false,
      },
      {
        name: "uretici_email",
        label: "Üretici Firma E-posta",
        type: "text",
        required: false,
      },
      {
        name: "musteri_firma",
        label: "Müşteri Firma Adı",
        type: "text",
        required: true,
      },
      {
        name: "musteri_adres",
        label: "Müşteri Adresi",
        type: "textarea",
        required: true,
      },
      {
        name: "musteri_yetkili",
        label: "Müşteri Yetkilisi",
        type: "text",
        required: true,
      },
      {
        name: "musteri_telefon",
        label: "Müşteri Telefon",
        type: "text",
        required: true,
      },
      {
        name: "musteri_email",
        label: "Müşteri E-posta",
        type: "text",
        required: true,
      },
      {
        name: "musteri_vergi_dairesi",
        label: "Müşteri Vergi Dairesi",
        type: "text",
        required: true,
      },
      {
        name: "musteri_vergi_no",
        label: "Müşteri Vergi No",
        type: "text",
        required: true,
      },
      {
        name: "musteri_mersis",
        label: "Müşteri MERSİS / Kayıt No",
        type: "text",
        required: false,
      },
      {
        name: "pilot_numune_aktif",
        label: "Pilot Ürün Numunesi Koşulu",
        type: "checkbox",
        required: false,
        default: false,
        description:
          "Numune üretimi ücretsiz, ancak iptal durumunda ücret tahsil edilir",
      },
      {
        name: "pilot_numune_fiyat",
        label: "Numune Başı Ücret (TL)",
        type: "number",
        required: false,
        default: 400,
        min: 0,
        conditionalOn: "pilot_numune_aktif",
        description:
          "Üretim iptali durumunda numune başına tahsil edilecek tutar",
      },
      {
        name: "odeme_guvence_aktif",
        label: "Ödeme Güvence Maddeleri",
        type: "checkbox",
        required: false,
        default: true,
        description:
          "Ödeme gecikmesi, tahsilat koruma ve yaptırım maddelerini aktif eder (Madde 9A & 9B)",
      },
      {
        name: "odeme_gecikme_gun",
        label: "Üretim Askıya Alma Süresi (Gün)",
        type: "number",
        required: false,
        default: 10,
        min: 1,
        max: 90,
        conditionalOn: "odeme_guvence_aktif",
        description: "Bu süre aşıldığında üretim askıya alınabilir",
      },
      {
        name: "odeme_iptal_gun",
        label: "Sipariş İptal Süresi (Gün)",
        type: "number",
        required: false,
        default: 30,
        min: 1,
        max: 180,
        conditionalOn: "odeme_guvence_aktif",
        description: "Bu süre aşıldığında sipariş iptal edilmiş sayılır",
      },
      {
        name: "depolama_ucret_orani",
        label: "Günlük Depolama Ücreti Oranı (%)",
        type: "number",
        required: false,
        default: 0.1,
        min: 0,
        step: 0.1,
        conditionalOn: "odeme_guvence_aktif",
        description: "Parti değerinin yüzdesi olarak günlük depolama ücreti",
      },
      {
        name: "teslimat_suresi",
        label: "Teslimat Süresi (İş Günü)",
        type: "text",
        required: true,
        default: "15-30",
      },
      {
        name: "teslim_sekli",
        label: "Teslim Şekli",
        type: "select",
        options: ["EXW", "Franco", "Ex-Works"],
        required: true,
        default: "EXW",
      },
      {
        name: "avans_orani",
        label: "Avans Oranı (%)",
        type: "number",
        required: true,
        default: 50,
      },
      {
        name: "bakiye_orani",
        label: "Bakiye Oranı (%)",
        type: "number",
        required: true,
        default: 50,
      },
      {
        name: "gizlilik_suresi",
        label: "Gizlilik Süresi (Yıl)",
        type: "number",
        required: true,
        default: 5,
      },
      {
        name: "sozlesme_suresi",
        label: "Sözleşme Süresi (Yıl)",
        type: "number",
        required: true,
        default: 1,
      },
      {
        name: "baslangic_tarihi",
        label: "Başlangıç Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "yetkili_mahkeme",
        label: "Yetkili Mahkeme",
        type: "text",
        required: true,
        default: "İstanbul (Merkez) Mahkemeleri ve İcra Daireleri",
      },
      {
        name: "imza_tarihi",
        label: "İmza Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "mkngroup_yetkili",
        label: "MKNGROUP Yetkili Ad Soyad",
        type: "text",
        required: true,
      },
      {
        name: "mkngroup_gorev",
        label: "MKNGROUP Yetkili Görevi",
        type: "text",
        required: true,
      },
      {
        name: "musteri_yetkili_imza",
        label: "Müşteri Yetkili Ad Soyad (İmza)",
        type: "text",
        required: true,
      },
      {
        name: "musteri_gorev",
        label: "Müşteri Yetkili Görevi",
        type: "text",
        required: true,
      },
    ],
  },

  [CONTRACT_TYPES.FASON_KOZMETIK]: {
    title: "FASON KOZMETİK ÜRETİM SÖZLEŞMESİ",
    content: `
Bu sözleşme, aşağıda belirtilen taraflar arasında aşağıdaki şartlar çerçevesinde imzalanmıştır.

MADDE 1 - TARAFLAR

1.1. ÜRETİCİ:
MKN GROUP / Aspar İlaç Kozmetik Gıda Sanayi A.Ş.
Adres: Yakuplu Mah. Dereboyu Cad. No:4/1, Beylikdüzü, İstanbul
Telefon: +90 536 592 30 35
E-posta: aspar@mkngroup.com.tr
Vergi Dairesi: {{vergi_dairesi_uretici}}
Vergi No: {{vergi_no_uretici}}

1.2. MÜŞTERİ:
Firma Ünvanı: {{musteri_firma}}
Adres: {{musteri_adres}}
Yetkili: {{musteri_yetkili}}
Telefon: {{musteri_telefon}}
E-posta: {{musteri_email}}
Vergi Dairesi: {{musteri_vergi_dairesi}}
Vergi No: {{musteri_vergi_no}}

MADDE 2 - SÖZLEŞMENİN KONUSU

2.1. İşbu sözleşme, MÜŞTERİ'nin talep ettiği kozmetik ürünlerin ÜRETİCİ tarafından fason olarak üretilmesi, ambalajlanması ve teslim edilmesi hizmetlerini kapsamaktadır.

2.2. Üretilecek ürünler, formülasyonları, miktarları ve teknik özellikleri Ek-1'de belirtilmiştir.

MADDE 3 - TARAFLARIN YÜKÜMLÜLÜKLERİ

3.1. ÜRETİCİ'nin Yükümlülükleri:
a) Ürünlerin, Türk Gıda Kodeksi, Kozmetik Yönetmeliği ve ilgili tüm mevzuata uygun şekilde üretilmesi,
b) TSE, ISO 9001, ISO 22716 (GMP) ve diğer gerekli belgelendirmelere sahip tesislerde üretim yapılması,
c) Hammadde ve ambalaj malzemelerinin kalite standartlarına uygunluğunun kontrolü,
d) Üretim süreçlerinin kayıt altına alınması ve ürün izlenebilirliğinin sağlanması,
e) Ürünlerin belirlenen süre içinde teslim edilmesi,
f) Üretim ile ilgili tüm teknik dokümantasyonun hazırlanması (ÜRİF, KKD, stabilite testleri vb.)

3.2. MÜŞTERİ'nin Yükümlülükleri:
a) Ürün formülasyonlarının yasal mevzuata uygun olarak temin edilmesi,
b) Üretim için gerekli belgelerin zamanında sağlanması (marka tescil, etiket onayları vb.),
c) Özel hammadde veya ambalaj malzemesi talebi durumunda bunların temini veya maliyetinin karşılanması,
d) Ödeme yükümlülüklerinin sözleşme şartlarına uygun yerine getirilmesi,
e) Ürün formülasyonu, markası ve özel bilgilerin gizliliğinden sorumlu olunması

MADDE 4 - ÜRÜN KALİTESI VE STANDARTLAR

4.1. Tüm ürünler, Kozmetik Yönetmeliği (27.10.2005 tarih, 25977 sayılı), ISO 22716 (GMP) standardı ve Türk Gıda Kodeksi'ne uygun olarak üretilecektir.

4.2. ÜRETİCİ, üretim öncesi numune onayı alacak ve üretim sonrası kalite kontrol raporlarını MÜŞTERİ'ye sunacaktır.

4.3. Hammadde kalitesi, mikrobiyal yük testleri, stabilite testleri ve ambalaj uygunluk kontrolleri yapılacaktır.

MADDE 5 - TESLİMAT ŞARTLARI

5.1. Sipariş onay tarihinden itibaren {{teslimat_suresi}} iş günü içinde teslimat gerçekleştirilecektir.

5.2. Teslimat adresi: {{teslimat_adresi}}

5.3. Teslimat şekli: {{teslimat_sekli}} (Franco / Ex-Works)

5.4. Acil üretim talepleri için ek ücretlendirme yapılabilir.

MADDE 6 - FİYATLANDIRMA VE ÖDEME ŞARTLARI

6.1. Birim fiyatlar ve toplam maliyet Ek-2'de belirtilmiştir.

6.2. Ödeme Koşulları: {{odeme_kosullari}}
- Sipariş öncesi avans: %{{avans_orani}}
- Kalan ödeme: Teslimat öncesi / {{vade_suresi}} gün vade

6.3. Ödemeler banka havalesi veya çek ile yapılacaktır.

6.4. KDV dahil değildir, ayrıca faturaya yansıtılacaktır.

MADDE 7 - ÜRÜN SORUMLULUGU VE GARANTİ

7.1. ÜRETİCİ, üretim kalitesi ve standartlara uygunluktan sorumludur.

7.2. Üretim hatalarından kaynaklanan kusurlar için ÜRETİCİ sorumludur ve kusurlu ürünler ücretsiz değiştirilir.

7.3. MÜŞTERİ tarafından temin edilen formülasyon, hammadde veya ambalaj kaynaklı hatalardan ÜRETİCİ sorumlu değildir.

7.4. Ürün raf ömrü: {{raf_omru}} ay (üretim tarihinden itibaren)

7.5. Piyasaya arz sonrası ürün sorumluluğu MÜŞTERİ'ye aittir.

MADDE 8 - FİKRİ MÜLKİYET VE GİZLİLİK

8.1. Formülasyonlar, teknik bilgiler ve ticari sırlar her iki taraf için gizlidir.

8.2. ÜRETİCİ, MÜŞTERİ'nin marka ve patentlerini korumakla yükümlüdür.

8.3. Üretilen ürünlerin ticari markası ve patent hakları MÜŞTERİ'ye aittir.

8.4. ÜRETİCİ, öğrendiği formülasyonları ve ticari bilgileri üçüncü şahıslarla paylaşamaz.

MADDE 9 - MÜCBİR SEBEPLER

9.1. Doğal afetler, savaş, salgın hastalık, hükümet kararları ve tarafların kontrolü dışındaki olaylar mücbir sebep sayılır.

9.2. Mücbir sebep halinde, tarafların yükümlülükleri askıya alınır ve gecikme cezası uygulanmaz.

MADDE 10 - SÖZLEŞMENİN SÜRESİ VE FESHİ

10.1. Sözleşme süresi: {{sozlesme_suresi}} ({{baslangic_tarihi}} - {{bitis_tarihi}})

10.2. Sözleşme, süre sonunda otomatik olarak yenilenebilir veya feshedilebilir.

10.3. Taraflardan biri, {{fesih_bildirimi}} gün önceden yazılı bildirimde bulunarak sözleşmeyi feshedebilir.

10.4. Ödeme yükümlülüklerinin yerine getirilmemesi durumunda, ÜRETİCİ sözleşmeyi derhal feshedebilir.

MADDE 11 - UYUŞMAZLIK ÇÖZÜMÜ

11.1. Sözleşmeden doğacak uyuşmazlıklarda öncelikle dostane çözüm aranacaktır.

11.2. Çözüm sağlanamazsa, İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

MADDE 12 - YÜRÜRLÜK

12.1. İşbu sözleşme {{imza_tarihi}} tarihinde imzalanmış ve {{yururluk_tarihi}} tarihinde yürürlüğe girmiştir.

12.2. Sözleşme {{nüsha_sayisi}} nüsha olarak düzenlenmiş ve taraflarca imzalanmıştır.

[SIGNATURE_SECTION]
ÜRETİCİ MÜŞTERİ
____________________ ____________________
____________________ ____________________
[/SIGNATURE_SECTION]
    `,
    fields: [
      {
        name: "vergi_dairesi_uretici",
        label: "Üretici Vergi Dairesi",
        type: "text",
        required: true,
      },
      {
        name: "vergi_no_uretici",
        label: "Üretici Vergi No",
        type: "text",
        required: true,
      },
      {
        name: "teslimat_suresi",
        label: "Teslimat Süresi (İş Günü)",
        type: "number",
        required: true,
      },
      {
        name: "teslimat_adresi",
        label: "Teslimat Adresi",
        type: "textarea",
        required: true,
      },
      {
        name: "teslimat_sekli",
        label: "Teslimat Şekli",
        type: "select",
        options: ["Franco", "Ex-Works"],
        required: true,
      },
      {
        name: "odeme_kosullari",
        label: "Ödeme Koşulları",
        type: "text",
        required: true,
      },
      {
        name: "avans_orani",
        label: "Avans Oranı (%)",
        type: "number",
        required: true,
      },
      {
        name: "vade_suresi",
        label: "Vade Süresi (Gün)",
        type: "number",
        required: false,
      },
      {
        name: "raf_omru",
        label: "Raf Ömrü (Ay)",
        type: "number",
        required: true,
      },
      {
        name: "sozlesme_suresi",
        label: "Sözleşme Süresi",
        type: "text",
        required: true,
      },
      {
        name: "baslangic_tarihi",
        label: "Başlangıç Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "bitis_tarihi",
        label: "Bitiş Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "fesih_bildirimi",
        label: "Fesih Bildirim Süresi (Gün)",
        type: "number",
        required: true,
      },
      {
        name: "imza_tarihi",
        label: "İmza Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "yururluk_tarihi",
        label: "Yürürlük Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "nüsha_sayisi",
        label: "Nüsha Sayısı",
        type: "number",
        required: true,
        default: 2,
      },
    ],
  },

  [CONTRACT_TYPES.FASON_GIDA]: {
    title: "FASON GIDA ÜRETİM SÖZLEŞMESİ",
    content: `
Bu sözleşme, aşağıda belirtilen taraflar arasında aşağıdaki şartlar çerçevesinde imzalanmıştır.

MADDE 1 - TARAFLAR

1.1. ÜRETİCİ:
MKN GROUP
Adres: Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul
Telefon: +90 531 494 25 94
E-posta: info@mkngroup.com.tr
Vergi Dairesi: {{vergi_dairesi_uretici}}
Vergi No: {{vergi_no_uretici}}

1.2. MÜŞTERİ:
Firma Ünvanı: {{musteri_firma}}
Adres: {{musteri_adres}}
Yetkili: {{musteri_yetkili}}
Telefon: {{musteri_telefon}}
E-posta: {{musteri_email}}
Vergi Dairesi: {{musteri_vergi_dairesi}}
Vergi No: {{musteri_vergi_no}}

MADDE 2 - SÖZLEŞMENİN KONUSU

2.1. İşbu sözleşme, MÜŞTERİ'nin talep ettiği gıda takviyesi ürünlerinin ÜRETİCİ tarafından fason olarak üretilmesi, ambalajlanması ve teslim edilmesi hizmetlerini kapsamaktadır.

2.2. Üretilecek ürünler, formülasyonları, miktarları ve teknik özellikleri Ek-1'de belirtilmiştir.

MADDE 3 - TARAFLARIN YÜKÜMLÜLÜKLERİ

3.1. ÜRETİCİ'nin Yükümlülükleri:
a) Ürünlerin, Türk Gıda Kodeksi ve ilgili tüm gıda mevzuatına uygun şekilde üretilmesi,
b) ISO 22000, HACCP ve GMP belgelerine sahip tesislerde üretim yapılması,
c) Hammadde ve ambalaj malzemelerinin gıda güvenliği standartlarına uygunluğunun kontrolü,
d) Üretim kayıtlarının tutulması ve ürün izlenebilirliğinin sağlanması,
e) Gıda güvenliği ve hijyen kurallarına uyulması,
f) Gerekli analizlerin yapılması (mikrobiyolojik, kimyasal, fiziksel testler)

3.2. MÜŞTERİ'nin Yükümlülükleri:
a) Ürün formülasyonlarının Türk Gıda Kodeksi'ne uygun olarak hazırlanması,
b) Tarım ve Orman Bakanlığı onaylarının alınması,
c) Ürün etiket bilgileri ve beyannamelerinin sağlanması,
d) Özel hammadde taleplerinin zamanında temin edilmesi,
e) Sözleşme bedelinin zamanında ödenmesi

MADDE 4 - GIDA GÜVENLİĞİ VE KALİTE

4.1. Tüm ürünler, Türk Gıda Kodeksi, HACCP, ISO 22000 ve GMP standartlarına uygun olarak üretilecektir.

4.2. Hammadde kabulünde, üretim sırasında ve bitmiş üründe gerekli analizler yapılacaktır.

4.3. Mikrobiyolojik, fiziksel ve kimyasal testler akredite laboratuvarlarda gerçekleştirilecektir.

MADDE 5 - TESLİMAT ŞARTLARI

5.1. Üretim süresi: Sipariş onayından itibaren {{teslimat_suresi}} iş günü

5.2. Teslimat adresi: {{teslimat_adresi}}

5.3. Teslimat şekli: {{teslimat_sekli}}

5.4. Ürünler, gıda güvenliği standartlarına uygun ambalajlarda teslim edilecektir.

MADDE 6 - FİYATLANDIRMA VE ÖDEME

6.1. Fiyatlar Ek-2'de belirtilmiştir.

6.2. Ödeme Koşulları:
- Avans: %{{avans_orani}}
- Kalan ödeme: {{odeme_sekli}}

6.3. Fiyatlara KDV dahil değildir.

MADDE 7 - ÜRÜN SORUMLULUGU

7.1. Üretim sürecinden kaynaklanan kusurlar ÜRETİCİ sorumluluğundadır.

7.2. Formülasyon ve hammadde kalitesinden MÜŞTERİ sorumludur.

7.3. Raf ömrü: {{raf_omru}} ay

7.4. Piyasa gözetimi ve ürün sorumluluğu MÜŞTERİ'ye aittir.

MADDE 8 - GİZLİLİK

8.1. Formülasyonlar ve ticari sırlar gizli tutulacaktır.

8.2. ÜRETİCİ, MÜŞTERİ'nin formülasyonlarını üçüncü kişilerle paylaşamaz.

MADDE 9 - SÖZLEŞMENİN SÜRESİ

9.1. Sözleşme süresi: {{sozlesme_suresi}} ({{baslangic_tarihi}} - {{bitis_tarihi}})

9.2. Fesih bildirimi: {{fesih_bildirimi}} gün önceden

MADDE 10 - UYUŞMAZLIK ÇÖZÜMÜ

10.1. İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

[SIGNATURE_SECTION]
ÜRETİCİ MÜŞTERİ
____________________ ____________________
____________________ ____________________
[/SIGNATURE_SECTION]
    `,
    fields: [
      {
        name: "vergi_dairesi_uretici",
        label: "Üretici Vergi Dairesi",
        type: "text",
        required: true,
      },
      {
        name: "vergi_no_uretici",
        label: "Üretici Vergi No",
        type: "text",
        required: true,
      },
      {
        name: "teslimat_suresi",
        label: "Teslimat Süresi (İş Günü)",
        type: "number",
        required: true,
      },
      {
        name: "teslimat_adresi",
        label: "Teslimat Adresi",
        type: "textarea",
        required: true,
      },
      {
        name: "teslimat_sekli",
        label: "Teslimat Şekli",
        type: "select",
        options: ["Franco", "Ex-Works"],
        required: true,
      },
      {
        name: "avans_orani",
        label: "Avans Oranı (%)",
        type: "number",
        required: true,
      },
      {
        name: "odeme_sekli",
        label: "Ödeme Şekli",
        type: "text",
        required: true,
      },
      {
        name: "raf_omru",
        label: "Raf Ömrü (Ay)",
        type: "number",
        required: true,
      },
      {
        name: "sozlesme_suresi",
        label: "Sözleşme Süresi",
        type: "text",
        required: true,
      },
      {
        name: "baslangic_tarihi",
        label: "Başlangıç Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "bitis_tarihi",
        label: "Bitiş Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "fesih_bildirimi",
        label: "Fesih Bildirim Süresi (Gün)",
        type: "number",
        required: true,
      },
    ],
  },

  [CONTRACT_TYPES.FASON_TEMIZLIK]: {
    title: "FASON TEMİZLİK ÜRÜNLERİ ÜRETİM SÖZLEŞMESİ",
    content: `
Bu sözleşme, aşağıda belirtilen taraflar arasında aşağıdaki şartlar çerçevesinde imzalanmıştır.

MADDE 1 - TARAFLAR

1.1. ÜRETİCİ:
Doğukan Kimya Temizlik Tesisi A.Ş. / MKN GROUP
Adres: Yakuplu Mah. Haramidere Sanayi Sitesi, B Blok No:107, Beylikdüzü, İstanbul
Telefon: +90 531 494 25 94
E-posta: dogukan@mkngroup.com.tr
Vergi Dairesi: {{vergi_dairesi_uretici}}
Vergi No: {{vergi_no_uretici}}

1.2. MÜŞTERİ:
Firma Ünvanı: {{musteri_firma}}
Adres: {{musteri_adres}}
Yetkili: {{musteri_yetkili}}
Telefon: {{musteri_telefon}}
E-posta: {{musteri_email}}
Vergi Dairesi: {{musteri_vergi_dairesi}}
Vergi No: {{musteri_vergi_no}}

MADDE 2 - SÖZLEŞMENİN KONUSU

2.1. İşbu sözleşme, MÜŞTERİ'nin talep ettiği temizlik ve bakım ürünlerinin ÜRETİCİ tarafından fason olarak üretilmesi, ambalajlanması ve teslim edilmesi hizmetlerini kapsamaktadır.

2.2. Üretim ürün grupları: Sıvı deterjan, yumuşatıcı, çamaşır suyu, yüzey temizleyiciler, cam temizleyiciler ve ilgili temizlik ürünleri.

MADDE 3 - TARAFLARIN YÜKÜMLÜLÜKLERİ

3.1. ÜRETİCİ'nin Yükümlülükleri:
a) Ürünlerin, Biyosidal Ürünler Yönetmeliği ve ilgili mevzuata uygun üretilmesi,
b) TSE, ISO 9001, ISO 14001 belgeli tesislerde üretim,
c) Kalite kontrol ve testlerin yapılması (pH, viskozite, yoğunluk, performans testleri),
d) Çevre ve iş güvenliği standartlarına uyum,
e) Ürün güvenlik bilgi formlarının (MSDS) hazırlanması

3.2. MÜŞTERİ'nin Yükümlülükleri:
a) Ürün formülasyonlarının yasal mevzuata uygun temin edilmesi,
b) Biyosidal ürün onaylarının alınması (gerekli ise),
c) Etiket ve ambalaj bilgilerinin CLP Yönetmeliği'ne uygun hazırlanması,
d) Ödeme yükümlülüklerinin yerine getirilmesi

MADDE 4 - KALİTE STANDARTLARI

4.1. Ürünler, TSE standartları ve ilgili teknik düzenlemelere uygun üretilecektir.

4.2. Her parti için kalite kontrol raporu düzenlenecektir.

4.3. Hammadde kabulünde ve bitmiş üründe gerekli testler yapılacaktır.

MADDE 5 - TESLİMAT

5.1. Teslimat süresi: {{teslimat_suresi}} iş günü

5.2. Teslimat adresi: {{teslimat_adresi}}

5.3. Teslimat şekli: {{teslimat_sekli}}

MADDE 6 - FİYATLANDIRMA VE ÖDEME

6.1. Birim fiyatlar Ek-2'de belirtilmiştir.

6.2. Ödeme Koşulları:
- Avans: %{{avans_orani}}
- Kalan: {{odeme_sekli}}

MADDE 7 - ÜRÜN SORUMLULUGU

7.1. Üretim kalitesi ÜRETİCİ sorumluluğundadır.

7.2. Formülasyon uygunluğu MÜŞTERİ sorumluluğundadır.

7.3. Raf ömrü: {{raf_omru}} ay

MADDE 8 - GİZLİLİK

8.1. Formülasyonlar ve ticari bilgiler gizli tutulacaktır.

MADDE 9 - SÖZLEŞMENİN SÜRESİ

9.1. Sözleşme süresi: {{sozlesme_suresi}} ({{baslangic_tarihi}} - {{bitis_tarihi}})

MADDE 10 - UYUŞMAZLIK ÇÖZÜMÜ

10.1. İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

[SIGNATURE_SECTION]
ÜRETİCİ MÜŞTERİ
____________________ ____________________
____________________ ____________________
[/SIGNATURE_SECTION]
    `,
    fields: [
      {
        name: "vergi_dairesi_uretici",
        label: "Üretici Vergi Dairesi",
        type: "text",
        required: true,
      },
      {
        name: "vergi_no_uretici",
        label: "Üretici Vergi No",
        type: "text",
        required: true,
      },
      {
        name: "teslimat_suresi",
        label: "Teslimat Süresi (İş Günü)",
        type: "number",
        required: true,
      },
      {
        name: "teslimat_adresi",
        label: "Teslimat Adresi",
        type: "textarea",
        required: true,
      },
      {
        name: "teslimat_sekli",
        label: "Teslimat Şekli",
        type: "select",
        options: ["Franco", "Ex-Works"],
        required: true,
      },
      {
        name: "avans_orani",
        label: "Avans Oranı (%)",
        type: "number",
        required: true,
      },
      {
        name: "odeme_sekli",
        label: "Ödeme Şekli",
        type: "text",
        required: true,
      },
      {
        name: "raf_omru",
        label: "Raf Ömrü (Ay)",
        type: "number",
        required: true,
      },
      {
        name: "sozlesme_suresi",
        label: "Sözleşme Süresi",
        type: "text",
        required: true,
      },
      {
        name: "baslangic_tarihi",
        label: "Başlangıç Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "bitis_tarihi",
        label: "Bitiş Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "fesih_bildirimi",
        label: "Fesih Bildirim Süresi (Gün)",
        type: "number",
        required: true,
      },
    ],
  },

  [CONTRACT_TYPES.FULFILLMENT]: {
    title: "E-TİCARET FULFILLMENT HİZMET SÖZLEŞMESİ",
    content: `
Bu sözleşme, aşağıda belirtilen taraflar arasında aşağıdaki şartlar çerçevesinde imzalanmıştır.

MADDE 1 - TARAFLAR

1.1. HİZMET SAĞLAYICI:
MKN GROUP
Adres: Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul
Telefon: +90 531 494 25 94
E-posta: info@mkngroup.com.tr
Vergi Dairesi: {{vergi_dairesi_uretici}}
Vergi No: {{vergi_no_uretici}}

1.2. MÜŞTERİ:
Firma Ünvanı: {{musteri_firma}}
Adres: {{musteri_adres}}
Yetkili: {{musteri_yetkili}}
Telefon: {{musteri_telefon}}
E-posta: {{musteri_email}}
Vergi Dairesi: {{musteri_vergi_dairesi}}
Vergi No: {{musteri_vergi_no}}

MADDE 2 - SÖZLEŞMENİN KONUSU

2.1. İşbu sözleşme, MÜŞTERİ'nin e-ticaret operasyonları için gerekli depolama, sipariş toplama, paketleme, kargolama ve stok yönetimi hizmetlerini kapsamaktadır.

MADDE 3 - HİZMET KAPSAMI

3.1. Hizmet Sağlayıcı'nın Sunacağı Hizmetler:
a) Ürünlerin depoya kabulü ve yerleştirilmesi,
b) Stok takibi ve envanter yönetimi,
c) Sipariş alma ve toplama (picking),
d) Ürün paketleme ve etiketleme,
e) Kargo firmalarıyla entegrasyon ve gönderi hazırlığı,
f) İade yönetimi,
g) Gerçek zamanlı stok raporlama ve entegrasyon (API/Entegratör)

3.2. Depo Alanı: {{depo_alani}} m² alan tahsis edilecektir.

3.3. Entegrasyon Platformları: {{entegrasyon_platformlari}} (Trendyol, Hepsiburada, N11, vb.)

MADDE 4 - FİYATLANDIRMA

4.1. Hizmet Bedelleri (Aylık):
- Depolama ücreti: {{depolama_ucreti}} TL/m² veya palet
- Sipariş işleme: {{siparis_islem_ucreti}} TL/sipariş
- Paketleme: {{paketleme_ucreti}} TL/adet
- Kargo entegrasyonu: {{kargo_entegrasyon}} TL/gönderi
- İade işlemleri: {{iade_islem_ucreti}} TL/adet

4.2. Minimum aylık hizmet bedeli: {{minimum_aylik_bedel}} TL

MADDE 5 - ÖDEME ŞARTLARI

5.1. Faturalar aylık olarak kesilecektir.

5.2. Ödeme vadesi: {{odeme_vadesi}} gün

5.3. Ödeme yöntemi: Banka havalesi

MADDE 6 - STOK SORUMLULUGU

6.1. Depolanan ürünler sigortalıdır.

6.2. Hizmet Sağlayıcı, kendi kusuru ile oluşan kayıp ve hasarlardan sorumludur.

6.3. Doğal afet, yangın, hırsızlık gibi durumlar sigorta kapsamındadır.

MADDE 7 - STOK KONTROLÜ

7.1. Düzenli stok sayımı yapılacaktır.

7.2. Stok uyuşmazlıkları 48 saat içinde bildirilecektir.

MADDE 8 - VERİ GÜVENLİĞİ

8.1. Müşteri verileri gizli tutulacaktır.

8.2. KVKK (Kişisel Verilerin Korunması Kanunu) hükümlerine uyulacaktır.

MADDE 9 - SÖZLEŞMENİN SÜRESİ

9.1. Sözleşme süresi: {{sozlesme_suresi}} ({{baslangic_tarihi}} - {{bitis_tarihi}})

9.2. Otomatik yenileme: {{otomatik_yenileme}}

9.3. Fesih bildirimi: {{fesih_bildirimi}} gün önceden

MADDE 10 - UYUŞMAZLIK ÇÖZÜMÜ

10.1. İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.


[SIGNATURE_SECTION]
HİZMET SAĞLAYICI MÜŞTERİ
____________________ ____________________
____________________ ____________________
[/SIGNATURE_SECTION]
    `,
    fields: [
      {
        name: "vergi_dairesi_uretici",
        label: "Hizmet Sağlayıcı Vergi Dairesi",
        type: "text",
        required: true,
      },
      {
        name: "vergi_no_uretici",
        label: "Hizmet Sağlayıcı Vergi No",
        type: "text",
        required: true,
      },
      {
        name: "depo_alani",
        label: "Depo Alanı (m²)",
        type: "number",
        required: true,
      },
      {
        name: "entegrasyon_platformlari",
        label: "Entegrasyon Platformları",
        type: "text",
        required: true,
      },
      {
        name: "depolama_ucreti",
        label: "Depolama Ücreti (TL/m²)",
        type: "number",
        required: true,
      },
      {
        name: "siparis_islem_ucreti",
        label: "Sipariş İşlem Ücreti (TL)",
        type: "number",
        required: true,
      },
      {
        name: "paketleme_ucreti",
        label: "Paketleme Ücreti (TL)",
        type: "number",
        required: true,
      },
      {
        name: "kargo_entegrasyon",
        label: "Kargo Entegrasyon Ücreti (TL)",
        type: "number",
        required: true,
      },
      {
        name: "iade_islem_ucreti",
        label: "İade İşlem Ücreti (TL)",
        type: "number",
        required: true,
      },
      {
        name: "minimum_aylik_bedel",
        label: "Minimum Aylık Bedel (TL)",
        type: "number",
        required: true,
      },
      {
        name: "odeme_vadesi",
        label: "Ödeme Vadesi (Gün)",
        type: "number",
        required: true,
      },
      {
        name: "sozlesme_suresi",
        label: "Sözleşme Süresi",
        type: "text",
        required: true,
      },
      {
        name: "baslangic_tarihi",
        label: "Başlangıç Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "bitis_tarihi",
        label: "Bitiş Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "otomatik_yenileme",
        label: "Otomatik Yenileme",
        type: "select",
        options: ["Evet", "Hayır"],
        required: true,
      },
      {
        name: "fesih_bildirimi",
        label: "Fesih Bildirim Süresi (Gün)",
        type: "number",
        required: true,
      },
    ],
  },

  [CONTRACT_TYPES.AMBALAJ]: {
    title: "AMBALAJ TEDARİK VE HİZMET SÖZLEŞMESİ",
    content: `
Bu sözleşme, aşağıda belirtilen taraflar arasında aşağıdaki şartlar çerçevesinde imzalanmıştır.

MADDE 1 - TARAFLAR

1.1. TEDARİKÇİ:
MKN GROUP
Adres: Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul
Telefon: +90 531 494 25 94
E-posta: info@mkngroup.com.tr
Vergi Dairesi: {{vergi_dairesi_uretici}}
Vergi No: {{vergi_no_uretici}}

1.2. MÜŞTERİ:
Firma Ünvanı: {{musteri_firma}}
Adres: {{musteri_adres}}
Yetkili: {{musteri_yetkili}}
Telefon: {{musteri_telefon}}
E-posta: {{musteri_email}}
Vergi Dairesi: {{musteri_vergi_dairesi}}
Vergi No: {{musteri_vergi_no}}

MADDE 2 - SÖZLEŞMENİN KONUSU

2.1. İşbu sözleşme, MÜŞTERİ'nin ihtiyaç duyduğu ambalaj malzemelerinin TEDARİKÇİ tarafından temin edilmesi, özel tasarım hizmetleri ve teslimatını kapsamaktadır.

2.2. Ambalaj Tipleri: PET şişe, cam şişe, pompa, kapak, kutu, etiket ve diğer ambalaj malzemeleri.

MADDE 3 - HİZMETLER

3.1. TEDARİKÇİ'nin Sunduğu Hizmetler:
a) Geniş ambalaj ürün yelpazesi,
b) Özel tasarım ve baskı hizmetleri,
c) Numune hazırlama,
d) Kalite kontrol ve test,
e) Zamanında teslimat

MADDE 4 - SİPARİŞ VE TESLİMAT

4.1. Minimum sipariş miktarları ürün bazında belirlenir.

4.2. Teslimat süresi: {{teslimat_suresi}} iş günü (standart ürünler), {{ozel_uretim_suresi}} iş günü (özel üretim)

4.3. Teslimat şekli: {{teslimat_sekli}}

MADDE 5 - FİYATLANDIRMA

5.1. Birim fiyatlar Ek-1'de belirtilmiştir.

5.2. Fiyatlar {{fiyat_gecerlilik}} ay geçerlidir.

MADDE 6 - ÖDEME

6.1. Ödeme koşulları:
- Avans: %{{avans_orani}}
- Vade: {{vade_suresi}} gün

MADDE 7 - KALİTE GARANTİSİ

7.1. Tüm ürünler kalite standartlarına uygun üretilir.

7.2. Kusurlu ürünler ücretsiz değiştirilir.

MADDE 8 - SÖZLEŞMENİN SÜRESİ

8.1. Sözleşme süresi: {{sozlesme_suresi}} ({{baslangic_tarihi}} - {{bitis_tarihi}})

MADDE 9 - UYUŞMAZLIK ÇÖZÜMÜ

9.1. İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.


[SIGNATURE_SECTION]
TEDARİKÇİ MÜŞTERİ
____________________ ____________________
____________________ ____________________
[/SIGNATURE_SECTION]
    `,
    fields: [
      {
        name: "vergi_dairesi_uretici",
        label: "Tedarikçi Vergi Dairesi",
        type: "text",
        required: true,
      },
      {
        name: "vergi_no_uretici",
        label: "Tedarikçi Vergi No",
        type: "text",
        required: true,
      },
      {
        name: "teslimat_suresi",
        label: "Standart Teslimat Süresi (İş Günü)",
        type: "number",
        required: true,
      },
      {
        name: "ozel_uretim_suresi",
        label: "Özel Üretim Süresi (İş Günü)",
        type: "number",
        required: true,
      },
      {
        name: "teslimat_sekli",
        label: "Teslimat Şekli",
        type: "select",
        options: ["Franco", "Ex-Works"],
        required: true,
      },
      {
        name: "fiyat_gecerlilik",
        label: "Fiyat Geçerlilik Süresi (Ay)",
        type: "number",
        required: true,
      },
      {
        name: "avans_orani",
        label: "Avans Oranı (%)",
        type: "number",
        required: true,
      },
      {
        name: "vade_suresi",
        label: "Vade Süresi (Gün)",
        type: "number",
        required: true,
      },
      {
        name: "sozlesme_suresi",
        label: "Sözleşme Süresi",
        type: "text",
        required: true,
      },
      {
        name: "baslangic_tarihi",
        label: "Başlangıç Tarihi",
        type: "date",
        required: true,
      },
      {
        name: "bitis_tarihi",
        label: "Bitiş Tarihi",
        type: "date",
        required: true,
      },
    ],
  },
};

export const getContractTemplate = (type) => {
  return CONTRACT_TEMPLATES[type] || null;
};

export const getContractTypeLabel = (type) => {
  return CONTRACT_TYPE_LABELS[type] || type;
};

export const getAllContractTypes = () => {
  return Object.keys(CONTRACT_TYPES).map((key) => ({
    value: CONTRACT_TYPES[key],
    label: CONTRACT_TYPE_LABELS[CONTRACT_TYPES[key]],
  }));
};
