export function SEOHead({
  title,
  description,
  canonical,
  ogImage = "/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
}) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://www.mkngroup.com.tr${ogImage}`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="MKNGROUP" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content={`https://www.mkngroup.com.tr${ogImage}`}
      />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Language alternatives */}
      <link rel="alternate" hrefLang="tr" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
    </>
  );
}
