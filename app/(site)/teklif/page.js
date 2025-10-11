"use client";

import { useState } from "react";
import Head from "next/head";
import { site } from "@/config/site";
import QuoteForm from "@/components/quote-form";
import { useQuoteSubmission } from "@/hooks/use-quote-submission";
import {
  SubmissionSuccess,
  SubmissionError,
  SubmissionLoading,
} from "@/components/submission-status";
import {
  OrganizationSchema,
  LocalBusinessSchema,
} from "@/components/structured-data";

// Teklif Sayfası için Structured Data
function TeklifStructuredData() {
  const quoteFormSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ücretsiz Teklif Alın - MKN GROUP",
    description:
      "MKN GROUP'tan fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için ücretsiz teklif alın.",
    url: "https://www.mkngroup.com.tr/teklif",
    mainEntity: {
      "@type": "Service",
      name: "Ücretsiz Teklif Hizmeti",
      description:
        "Fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için profesyonel teklif hazırlama",
      provider: {
        "@type": "Organization",
        name: "MKN GROUP",
        url: "https://www.mkngroup.com.tr",
        logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      },
      serviceType: [
        "Fason Üretim Danışmanlığı",
        "Ambalaj Çözümleri",
        "E-ticaret Operasyon Hizmetleri",
        "Dijital Pazarlama Hizmetleri",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "Ücretsiz teklif hazırlama hizmeti",
        availability: "https://schema.org/InStock",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ana Sayfa",
          item: "https://www.mkngroup.com.tr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Teklif Al",
          item: "https://www.mkngroup.com.tr/teklif",
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(quoteFormSchema) }}
    />
  );
}

export default function TeklifPage() {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Firebase submission hook
  const {
    isSubmitting,
    submitResult,
    submitForm,
    clearResult,
    resetSubmission,
    isSuccess,
    isError,
    hasErrors,
    errorMessage,
    successMessage,
  } = useQuoteSubmission();

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setShowSubmissionModal(true);
      const result = await submitForm(formData);

      if (result.success) {
        // Başarılı gönderim
        console.log("Form başarıyla gönderildi");
      } else {
        // Hata durumu
        console.error("Form gönderim hatası:", result.errors);
      }
    } catch (error) {
      console.error("Form gönderim hatası:", error);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setShowSubmissionModal(false);
    clearResult();
    resetSubmission();
  };

  return (
    <>
      <Head>
        <title>{`Ücretsiz Teklif Alın | ${site.name}`}</title>
        <meta
          name="description"
          content="MKN GROUP'tan fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için ücretsiz ve detaylı teklif alın. Uzman ekibimiz projenizi değerlendirip size özel çözümler sunuyor."
        />
        <meta
          name="keywords"
          content="ücretsiz teklif, fason üretim teklifi, ambalaj çözümleri teklifi, e-ticaret operasyon teklifi, dijital pazarlama teklifi, MKN GROUP teklif"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${site.url}/teklif`} />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`Ücretsiz Teklif Alın | ${site.name}`}
        />
        <meta
          property="og:description"
          content="MKN GROUP'tan fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için ücretsiz teklif alın."
        />
        <meta property="og:url" content={`${site.url}/teklif`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${site.url}/teklif-og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="MKN GROUP Ücretsiz Teklif Formu"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`Ücretsiz Teklif Alın | ${site.name}`}
        />
        <meta
          name="twitter:description"
          content="MKN GROUP'tan fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için ücretsiz teklif alın."
        />
        <meta
          name="twitter:image"
          content={`${site.url}/teklif-twitter-image.jpg`}
        />
        <meta
          name="twitter:image:alt"
          content="MKN GROUP Ücretsiz Teklif Formu"
        />

        {/* Additional Meta Tags */}
        <meta name="author" content="MKN GROUP" />
        <meta name="copyright" content="MKN GROUP" />
        <meta name="language" content="tr" />
        <meta name="geo.region" content="TR" />
        <meta name="geo.placename" content="İstanbul" />
        <meta name="geo.position" content="41.0082;28.9784" />
        <meta name="ICBM" content="41.0082, 28.9784" />
      </Head>

      {/* Structured Data */}
      <TeklifStructuredData />
      <OrganizationSchema />
      <LocalBusinessSchema />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="container mx-auto">
          <QuoteForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Submission Modal */}
        {showSubmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {isSubmitting && (
                <SubmissionLoading
                  title="Teklifiniz Gönderiliyor"
                  message="Lütfen bekleyin, teklifiniz işleniyor..."
                />
              )}

              {isSuccess && (
                <SubmissionSuccess
                  title="Teklif Başarıyla Gönderildi!"
                  message={
                    successMessage ||
                    "Teklifiniz başarıyla alındı. En kısa sürede size dönüş yapacağız."
                  }
                  onClose={handleCloseModal}
                />
              )}

              {isError && (
                <SubmissionError
                  title="Gönderim Hatası"
                  message={
                    errorMessage ||
                    "Teklifiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
                  }
                  onRetry={() => setShowSubmissionModal(false)}
                  onClose={handleCloseModal}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
