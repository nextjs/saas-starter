export default function SchemaOrg() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Focus your AI",
    "url": "https://your-domain.com",
    "description": "A next-generation SaaS platform for AI prompt engineering and training",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://your-domain.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/your-handle",
      "https://www.linkedin.com/company/your-company",
      "https://github.com/your-org"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Focus your AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://your-domain.com/logo.png",
        "width": 600,
        "height": 60
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
} 