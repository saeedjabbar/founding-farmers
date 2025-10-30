export default ({ env }) => ({
  seo: {
    enabled: true,
  },
  webtools: {
    enabled: true,
    config: {
      website_url: trimTrailingSlash(
        env('WEBTOOLS_WEBSITE_URL', env('WEBSITE_URL', env('SITE_URL', 'http://localhost:3000')))
      ),
      default_pattern: '/[pluralName]/[slug]',
      unique_per_locale: env.bool('WEBTOOLS_UNIQUE_PER_LOCALE', false),
    },
  },
  'webtools-addon-sitemap': {
    enabled: true,
    config: {
      cron: env('SITEMAP_CRON', '0 0 2 * * *'),
      limit: env.int('SITEMAP_MAX_LINKS', 45000),
      xsl: env.bool('SITEMAP_XSL_ENABLED', false),
      autoGenerate: env.bool('SITEMAP_AUTO_GENERATE', true),
    },
  },
});

function trimTrailingSlash(url?: string | null) {
  if (!url) {
    return url ?? null;
  }

  return url.replace(/\/+$/, '') || '/';
}
