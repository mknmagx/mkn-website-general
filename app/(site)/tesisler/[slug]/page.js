// import { notFound } from "next/navigation"
// import Link from "next/link"
// import { ChevronRight, MapPin, Users, Award, CheckCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"

// const facilities = {
//   "ana-tesis": {
//     name: "Ana Üretim Tesisi",
//     description:
//       "Modern teknoloji ile donatılmış ana üretim tesisimiz, yüksek kapasiteli üretim hatları ve otomatik sistemler ile kaliteli ürün üretimi gerçekleştirmektedir.",
//     images: [
//       "/main-facility-production-line.png",
//       "/main-facility-filling-line.png",
//       "/main-facility-packaging.png",
//       "/main-facility-quality-control.png",
//     ],
//     capacity: {
//       daily: "50.000 Ünite",
//       monthly: "1.500.000 Ünite",
//       lines: "5 Üretim Hattı",
//       area: "5.000 m²",
//     },
//     productionLines: [
//       "Kozmetik Krem & Losyon Hattı",
//       "Sıvı Ürün Dolum Hattı",
//       "Şampuan & Duş Jeli Hattı",
//       "Temizlik Ürünleri Hattı",
//       "Ambalajlama & Etiketleme Hattı",
//     ],
//     qualityLab: [
//       "Mikrobiyoloji Laboratuvarı",
//       "Fizikokimyasal Analiz",
//       "Stabilite Test Odaları",
//       "Hammadde Kalite Kontrol",
//     ],
//     certificates: ["GMP", "ISO 22716", "ISO 9001", "ISO 14001", "OHSAS 18001"],
//     address: "Organize Sanayi Bölgesi, İstanbul, Türkiye",
//     phone: "+90 5xx xxx xx xx",
//   },
//   "lab-tesis": {
//     name: "Laboratuvar & Pilot Tesis",
//     description:
//       "Ar-Ge çalışmaları ve pilot üretim için özel olarak tasarlanmış tesisimiz, yenilikçi ürün geliştirme ve test süreçlerini desteklemektedir.",
//     images: [
//       "/lab-facility-research.png",
//       "/lab-facility-pilot-line.png",
//       "/lab-facility-testing.png",
//       "/lab-facility-development.png",
//     ],
//     capacity: {
//       daily: "5.000 Ünite",
//       monthly: "150.000 Ünite",
//       lines: "2 Pilot Hat",
//       area: "2.000 m²",
//     },
//     productionLines: ["Pilot Üretim Hattı", "Numune Geliştirme Hattı"],
//     qualityLab: [
//       "Ar-Ge Laboratuvarı",
//       "Formülasyon Geliştirme",
//       "Mikrobiyoloji Test Lab",
//       "Stabilite & Uyumluluk Testleri",
//       "Sensöryel Analiz Odası",
//     ],
//     certificates: ["GLP", "ISO 17025", "Ar-Ge Merkezi Belgesi"],
//     address: "Teknopark İstanbul, İstanbul, Türkiye",
//     phone: "+90 5xx xxx xx xx",
//   },
// }

// export async function generateStaticParams() {
//   return Object.keys(facilities).map((slug) => ({
//     slug,
//   }))
// }

// export async function generateMetadata({ params }) {
//   const facility = facilities[params.slug]

//   if (!facility) {
//     return {
//       title: "Tesis Bulunamadı | MKNGROUP",
//     }
//   }

//   return {
//     title: `${facility.name} | MKNGROUP`,
//     description: facility.description,
//     alternates: {
//       canonical: `https://mkngroup.com.tr/tesisler/${params.slug}`,
//     },
//   }
// }

// export default function TesisDetayPage({ params }) {
//   const facility = facilities[params.slug]

//   if (!facility) {
//     notFound()
//   }

//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "LocalBusiness",
//     name: facility.name,
//     description: facility.description,
//     address: {
//       "@type": "PostalAddress",
//       addressCountry: "TR",
//       addressLocality: "İstanbul",
//       streetAddress: facility.address,
//     },
//     telephone: facility.phone,
//     url: `https://mkngroup.com.tr/tesisler/${params.slug}`,
//     parentOrganization: {
//       "@type": "Organization",
//       name: "MKNGROUP",
//     },
//   }

//   return (
//     <div className="min-h-screen">
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify(jsonLd),
//         }}
//       />

//       {/* Breadcrumb */}
//       <section className="py-4 bg-muted/30">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <nav className="flex items-center space-x-2 text-sm">
//             <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
//               Ana Sayfa
//             </Link>
//             <ChevronRight className="h-4 w-4 text-muted-foreground" />
//             <Link href="/tesisler" className="text-muted-foreground hover:text-primary transition-colors">
//               Tesisler
//             </Link>
//             <ChevronRight className="h-4 w-4 text-muted-foreground" />
//             <span className="text-foreground font-medium">{facility.name}</span>
//           </nav>
//         </div>
//       </section>

//       {/* Hero Section */}
//       <section className="py-16">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="max-w-4xl mx-auto">
//             <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">{facility.name}</h1>
//             <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{facility.description}</p>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//               <div className="text-center p-4 bg-muted/30 rounded-lg">
//                 <div className="text-2xl font-bold text-primary mb-1">{facility.capacity.daily}</div>
//                 <div className="text-sm text-muted-foreground">Günlük Kapasite</div>
//               </div>
//               <div className="text-center p-4 bg-muted/30 rounded-lg">
//                 <div className="text-2xl font-bold text-primary mb-1">{facility.capacity.lines}</div>
//                 <div className="text-sm text-muted-foreground">Üretim Hattı</div>
//               </div>
//               <div className="text-center p-4 bg-muted/30 rounded-lg">
//                 <div className="text-2xl font-bold text-primary mb-1">{facility.capacity.area}</div>
//                 <div className="text-sm text-muted-foreground">Tesis Alanı</div>
//               </div>
//               <div className="text-center p-4 bg-muted/30 rounded-lg">
//                 <div className="text-2xl font-bold text-primary mb-1">{facility.capacity.monthly}</div>
//                 <div className="text-sm text-muted-foreground">Aylık Kapasite</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Gallery */}
//       <section className="py-16 bg-muted/30">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-center mb-12">Tesis Görselleri</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {facility.images.map((image, index) => (
//               <div key={index} className="aspect-square overflow-hidden rounded-lg bg-muted">
//                 <img
//                   src={image || "/placeholder.svg"}
//                   alt={`${facility.name} - Görsel ${index + 1}`}
//                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Production Lines & Quality Lab */}
//       <section className="py-16">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//             {/* Production Lines */}
//             <Card className="p-8">
//               <h3 className="text-2xl font-bold mb-6 flex items-center">
//                 <Users className="h-6 w-6 text-primary mr-3" />
//                 Üretim Hatları
//               </h3>
//               <div className="space-y-3">
//                 {facility.productionLines.map((line, index) => (
//                   <div key={index} className="flex items-center space-x-3">
//                     <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
//                     <span>{line}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             {/* Quality Lab */}
//             <Card className="p-8">
//               <h3 className="text-2xl font-bold mb-6 flex items-center">
//                 <Award className="h-6 w-6 text-primary mr-3" />
//                 Kalite & Laboratuvar
//               </h3>
//               <div className="space-y-3">
//                 {facility.qualityLab.map((lab, index) => (
//                   <div key={index} className="flex items-center space-x-3">
//                     <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
//                     <span>{lab}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Certificates */}
//       <section className="py-16 bg-muted/30">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-center mb-12">Sertifikalar & Uyumluluk</h2>
//           <div className="flex flex-wrap justify-center gap-6">
//             {facility.certificates.map((cert, index) => (
//               <div
//                 key={index}
//                 className="bg-background rounded-lg p-6 text-center min-w-[120px] hover:shadow-md transition-shadow"
//               >
//                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
//                   <Award className="h-6 w-6 text-primary" />
//                 </div>
//                 <div className="font-semibold text-sm">{cert}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Contact Info */}
//       <section className="py-16">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="max-w-2xl mx-auto text-center">
//             <h2 className="text-3xl font-bold mb-6">Tesis İletişim</h2>
//             <div className="space-y-4 mb-8">
//               <div className="flex items-center justify-center space-x-2">
//                 <MapPin className="h-5 w-5 text-primary" />
//                 <span>{facility.address}</span>
//               </div>
//             </div>
//             <Button size="lg" asChild>
//               <Link href="/iletisim">Tesis Ziyareti Talep Et</Link>
//             </Button>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }
