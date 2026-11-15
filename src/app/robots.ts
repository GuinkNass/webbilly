import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/operador',
          '/operador/',
          '/api',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://webbilly.com.br/sitemap.xml',
    host: 'https://webbilly.com.br',
  };
}
