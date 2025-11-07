// import type { Core } from '@strapi/strapi';
import { PRIVACY_POLICY_BODY, PRIVACY_POLICY_TITLE } from './data/privacyPolicyPage';
import { STANDARDS_PAGE_BODY, STANDARDS_PAGE_TITLE } from './data/standardsPage';

const DEFAULT_LANGUAGE_CODE = 'und';

const WEBTOOLS_URL_PATTERNS: Array<{ uid: string; pattern: string }> = [
  { uid: 'api::story.story', pattern: '/stories/[slug]' },
  { uid: 'api::record.record', pattern: '/records/[slug]' },
  { uid: 'api::standard.standard', pattern: '/standards' },
  { uid: 'api::privacy-policy.privacy-policy', pattern: '/privacy-policy' },
];

const SITEMAP_CONTENT_TYPE_DEFAULTS: Record<string, { changefreq: string; priority: number; includeLastmod?: boolean }> = {
  'api::story.story': { changefreq: 'weekly', priority: 0.8, includeLastmod: true },
  'api::record.record': { changefreq: 'monthly', priority: 0.5, includeLastmod: true },
  'api::standard.standard': { changefreq: 'yearly', priority: 0.3, includeLastmod: true },
  'api::privacy-policy.privacy-policy': { changefreq: 'yearly', priority: 0.2, includeLastmod: true },
};

const SITEMAP_CUSTOM_ENTRY_DEFAULTS: Record<string, { changefreq: string; priority: number }> = {
  '/stories': { changefreq: 'daily', priority: 0.8 },
  '/records': { changefreq: 'weekly', priority: 0.6 },
  '/submit': { changefreq: 'monthly', priority: 0.2 },
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    await ensureStandardsPage(strapi);
    await ensurePrivacyPolicyPage(strapi);
    await backfillAuthorNames(strapi);
    await ensureWebtoolsUrlPatterns(strapi);
    await generateDefaultUrlAliases(strapi);
    await ensureSitemapSettings(strapi);
  },
};

async function ensureStandardsPage(strapi: any) {
  await ensureSingleTypeContent(strapi, 'api::standard.standard', {
    title: STANDARDS_PAGE_TITLE,
    body: STANDARDS_PAGE_BODY,
  }, 'Standards');
}

async function ensurePrivacyPolicyPage(strapi: any) {
  await ensureSingleTypeContent(strapi, 'api::privacy-policy.privacy-policy', {
    title: PRIVACY_POLICY_TITLE,
    body: PRIVACY_POLICY_BODY,
  }, 'Privacy policy');
}

async function ensureSingleTypeContent(strapi: any, uid: string, data: Record<string, unknown>, label: string) {
  try {
    const existingResult = await strapi.entityService.findMany(uid, {
      publicationState: 'preview',
    });

    const entry = Array.isArray(existingResult) ? existingResult[0] : existingResult;
    const isComplete = Object.entries(data).every(([key, value]) => {
      const field = entry?.[key];
      if (Array.isArray(value)) {
        return Array.isArray(field) && field.length > 0;
      }
      if (typeof value === 'string') {
        return typeof field === 'string' && field.trim().length > 0;
      }
      return Boolean(field);
    });

    if (!entry) {
      await strapi.entityService.create(uid, { data });
      strapi.log.info(`Created default ${label} content.`);
      return;
    }

    if (!isComplete) {
      await strapi.entityService.update(uid, entry.id, { data });
      strapi.log.info(`Backfilled ${label} content.`);
    }
  } catch (error: any) {
    strapi.log.warn(`Could not ensure ${label.toLowerCase()} content: ${error?.message ?? error}`);
  }
}

async function backfillAuthorNames(strapi: any) {
  try {
    const stories = await strapi.entityService.findMany('api::story.story', {
      filters: {
        $or: [{ authorName: { $null: true } }, { authorName: { $eq: '' } }],
      },
      populate: {
        createdBy: { fields: ['id', 'username', 'firstname', 'lastname', 'email'] },
        updatedBy: { fields: ['id', 'username', 'firstname', 'lastname', 'email'] },
      },
      publicationState: 'preview',
      limit: -1,
    });

    if (!stories?.length) {
      return;
    }

    for (const story of stories) {
      const displayName =
        (await resolveDisplayName(story?.updatedBy, strapi)) ??
        (await resolveDisplayName(story?.createdBy, strapi));
      if (!displayName) continue;

      await strapi.entityService.update('api::story.story', story.id, {
        data: { authorName: displayName },
      });
    }

    strapi.log.info(`Backfilled authorName for ${stories.length} story(ies).`);
  } catch (error) {
    strapi.log.warn(`Could not backfill story author names: ${error?.message ?? error}`);
  }
}

async function resolveDisplayName(user: any, strapiInstance: any): Promise<string | undefined> {
  if (!user) return undefined;

  const direct = deriveDisplayName(user);
  if (direct) return direct;

  if (user.id) {
    try {
      const fullUser = await strapiInstance.entityService.findOne('admin::user', user.id, {
        fields: ['username', 'firstname', 'lastname', 'email'],
      });
      return deriveDisplayName(fullUser);
    } catch (error) {
      strapiInstance.log.warn(`Failed to fetch admin user ${user.id} for author backfill: ${error?.message ?? error}`);
    }
  }

  return undefined;
}

function deriveDisplayName(user: any): string | undefined {
  if (!user) return undefined;
  if (user.username && user.username.trim().length > 0) {
    return user.username;
  }
  const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
  if (fullName.length > 0) {
    return fullName;
  }
  if (user.email) {
    const localPart = user.email.split('@')[0];
    if (localPart.length > 0) {
      return localPart;
    }
  }
  return undefined;
}

async function ensureWebtoolsUrlPatterns(strapi: any) {
  if (!strapi.plugin?.('webtools')) {
    return;
  }

  const availablePatterns = WEBTOOLS_URL_PATTERNS.filter(({ uid }) => Boolean(strapi.contentTypes?.[uid]));

  await Promise.all(
    availablePatterns.map(async ({ uid, pattern }) => {
      try {
        const existingPatterns = await strapi.documents('plugin::webtools.url-pattern').findMany({
          filters: { contenttype: uid },
        });

        const existingDefault = existingPatterns.find(
          (entry: any) => Array.isArray(entry?.languages) && entry.languages.includes(DEFAULT_LANGUAGE_CODE)
        );

        if (!existingDefault) {
          await strapi.documents('plugin::webtools.url-pattern').create({
            data: {
              contenttype: uid,
              pattern,
              languages: [DEFAULT_LANGUAGE_CODE],
            },
          });
          strapi.log.info(`Created Webtools URL pattern "${pattern}" for ${uid}.`);
          return;
        }

        const needsPatternUpdate = existingDefault.pattern !== pattern;
        const languages = Array.isArray(existingDefault.languages)
          ? Array.from(new Set([...existingDefault.languages, DEFAULT_LANGUAGE_CODE]))
          : [DEFAULT_LANGUAGE_CODE];
        const needsLanguageUpdate =
          !Array.isArray(existingDefault.languages) || !existingDefault.languages.includes(DEFAULT_LANGUAGE_CODE);

        if (needsPatternUpdate || needsLanguageUpdate) {
          await strapi.documents('plugin::webtools.url-pattern').update({
            documentId: existingDefault.documentId ?? existingDefault.id,
            data: {
              contenttype: uid,
              pattern,
              languages,
            },
          });
          strapi.log.info(`Updated Webtools URL pattern for ${uid} to "${pattern}".`);
        }
      } catch (error: any) {
        strapi.log.warn(`Could not ensure Webtools URL pattern for ${uid}: ${error?.message ?? error}`);
      }
    })
  );
}

async function generateDefaultUrlAliases(strapi: any) {
  if (!strapi.plugin?.('webtools')) {
    return;
  }

  try {
    const bulkGenerateService = strapi.plugin('webtools')?.service?.('bulk-generate');
    if (!bulkGenerateService?.generateUrlAliases) {
      return;
    }

    const contentTypes = WEBTOOLS_URL_PATTERNS.map(({ uid }) => uid).filter((uid) =>
      Boolean(strapi.contentTypes?.[uid])
    );

    if (!contentTypes.length) {
      return;
    }

    const generatedCount = await bulkGenerateService.generateUrlAliases({
      types: contentTypes,
      generationType: 'only_generated',
    });

    if (generatedCount > 0) {
      strapi.log.info(`Generated ${generatedCount} Webtools URL alias(es).`);
    }
  } catch (error: any) {
    strapi.log.warn(`Could not generate Webtools URL aliases: ${error?.message ?? error}`);
  }
}

async function ensureSitemapSettings(strapi: any) {
  if (!strapi.plugin?.('webtools-addon-sitemap')) {
    return;
  }

  try {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'sitemap',
    });

    const currentSettings = (await pluginStore.get({ key: 'settings' })) ?? {};
    const settings = { ...currentSettings };
    let hasChanges = false;

    const configuredHostname = normalizeHostname(strapi.config.get('plugin::webtools.website_url'));
    if (configuredHostname && normalizeHostname(settings.hostname) !== configuredHostname) {
      settings.hostname = configuredHostname;
      hasChanges = true;
    } else if (!settings.hostname) {
      settings.hostname = configuredHostname ?? '';
      if (settings.hostname) {
        hasChanges = true;
      }
    }

    if (settings.includeHomepage === undefined) {
      settings.includeHomepage = true;
      hasChanges = true;
    }

    if (settings.excludeDrafts === undefined) {
      settings.excludeDrafts = true;
      hasChanges = true;
    }

    if (!settings.hostname_overrides || typeof settings.hostname_overrides !== 'object') {
      settings.hostname_overrides = {};
      hasChanges = true;
    }

    if (settings.defaultLanguageUrlType === undefined) {
      settings.defaultLanguageUrlType = '';
      hasChanges = true;
    }

    if (settings.defaultLanguageUrl === undefined) {
      settings.defaultLanguageUrl = '';
      hasChanges = true;
    }

    const contentTypes: Record<string, any> =
      settings.contentTypes && typeof settings.contentTypes === 'object' ? { ...settings.contentTypes } : {};

    for (const [uid, defaults] of Object.entries(SITEMAP_CONTENT_TYPE_DEFAULTS)) {
      if (!strapi.contentTypes?.[uid]) {
        continue;
      }

      const existingType = contentTypes[uid] && typeof contentTypes[uid] === 'object' ? { ...contentTypes[uid] } : {};
      const languageConfig =
        existingType.languages && typeof existingType.languages === 'object' ? { ...existingType.languages } : {};
      const baseLanguage = languageConfig[DEFAULT_LANGUAGE_CODE]
        ? { ...languageConfig[DEFAULT_LANGUAGE_CODE] }
        : {};

      if (baseLanguage.changefreq === undefined) {
        baseLanguage.changefreq = defaults.changefreq;
        hasChanges = true;
      }

      if (baseLanguage.priority === undefined) {
        baseLanguage.priority = defaults.priority;
        hasChanges = true;
      }

      if (baseLanguage.includeLastmod === undefined && defaults.includeLastmod !== undefined) {
        baseLanguage.includeLastmod = defaults.includeLastmod;
        hasChanges = true;
      }

      languageConfig[DEFAULT_LANGUAGE_CODE] = baseLanguage;
      existingType.languages = languageConfig;
      contentTypes[uid] = existingType;
    }

    const customEntries: Record<string, any> =
      settings.customEntries && typeof settings.customEntries === 'object' ? { ...settings.customEntries } : {};

    for (const [path, defaults] of Object.entries(SITEMAP_CUSTOM_ENTRY_DEFAULTS)) {
      if (!customEntries[path]) {
        customEntries[path] = defaults;
        hasChanges = true;
      }
    }

    settings.contentTypes = contentTypes;
    settings.customEntries = customEntries;

    if (hasChanges) {
      await pluginStore.set({ key: 'settings', value: settings });
      strapi.log.info('Updated sitemap settings with default values.');
    }
  } catch (error: any) {
    strapi.log.warn(`Could not ensure sitemap settings: ${error?.message ?? error}`);
  }
}

function normalizeHostname(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.replace(/\/+$/, '');
}
