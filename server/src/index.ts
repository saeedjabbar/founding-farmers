// import type { Core } from '@strapi/strapi';
import { STANDARDS_PAGE_BODY, STANDARDS_PAGE_TITLE } from './data/standardsPage';

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
    await backfillAuthorNames(strapi);
  },
};

async function ensureStandardsPage(strapi: any) {
  try {
    const existingResult = await strapi.entityService.findMany('api::standard.standard', {
      publicationState: 'preview',
    });

    const entry = Array.isArray(existingResult) ? existingResult[0] : existingResult;
    const hasBody = Array.isArray(entry?.body) && entry.body.length > 0;
    const hasTitle = typeof entry?.title === 'string' && entry.title.trim().length > 0;

    const data = {
      title: STANDARDS_PAGE_TITLE,
      body: STANDARDS_PAGE_BODY,
    };

    if (!entry) {
      await strapi.entityService.create('api::standard.standard', { data });
      strapi.log.info('Created default Standards page content.');
      return;
    }

    if (!hasTitle || !hasBody) {
      await strapi.entityService.update('api::standard.standard', entry.id, { data });
      strapi.log.info('Backfilled Standards page content.');
    }
  } catch (error: any) {
    strapi.log.warn(`Could not ensure Standards page content: ${error?.message ?? error}`);
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
