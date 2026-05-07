import { Helmet } from 'react-helmet-async';

const SITE_URL =
  'https://yuratadevosyan.github.io/three-js-and-animations/three-webgl-showcase';
const SITE_NAME = 'Three.js WebGL Showcase';

export interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function SEO({
  title,
  description,
  path = '/',
  image = '/og-image.png',
  type = 'website',
}: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
