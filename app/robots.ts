import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/seller', '/buyer'],
    },
    sitemap: 'https://vconnect.co.ke/sitemap.xml',
  };
}
