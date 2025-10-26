// import type { Core } from '@strapi/strapi';

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
    await backfillAuthorNames(strapi);
  },
};

async function backfillAuthorNames(strapi: any) {
  try {
    const stories = await strapi.entityService.findMany('api::story.story', {
      filters: {
        authorName: { $null: true },
      },
      populate: ['createdBy'],
      publicationState: 'preview',
      limit: -1,
    });

    if (!stories?.length) {
      return;
    }

    for (const story of stories) {
      const createdBy = story?.createdBy;
      if (!createdBy) continue;
      const displayName =
        createdBy.username ??
        [createdBy.firstname, createdBy.lastname].filter(Boolean).join(' ').trim();
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
