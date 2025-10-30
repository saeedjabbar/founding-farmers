type UserLike = {
  id?: number | string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  roles?: Array<{ code: string }>;
};

type StoryLifecycleEvent = {
  params: { data?: Record<string, any> };
  state?: {
    user?: UserLike;
    auth?: {
      user?: UserLike;
    };
  };
  context?: {
    auth?: {
      user?: UserLike;
      credentials?: {
        user?: UserLike;
      };
    };
    state?: {
      user?: UserLike;
    };
  };
  result?: {
    createdBy?: UserLike;
    updatedBy?: UserLike;
    id: number | string;
    authorName?: string;
  };
};

function resolveActingUser(event: StoryLifecycleEvent): UserLike | undefined {
  return (
    event.state?.user ??
    event.state?.auth?.user ??
    event.context?.auth?.user ??
    event.context?.auth?.credentials?.user ??
    event.context?.state?.user
  );
}

function resolveDisplayNameFields(user: UserLike | undefined): string | undefined {
  if (!user) {
    return undefined;
  }

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

async function updateAuthorName(params: { data?: Record<string, any> }, user: UserLike | undefined) {
  if (!params.data) return;

  const displayName =
    resolveDisplayNameFields(user) ??
    (user?.id
      ? await fetchDisplayNameById(user.id)
      : undefined);

  if (displayName) {
    params.data.authorName = displayName;
  }
}

async function fetchDisplayNameById(id: number | string): Promise<string | undefined> {
  try {
    const user = await strapi.entityService.findOne('admin::user', id, {
      fields: ['username', 'firstname', 'lastname', 'email'],
    });
    return resolveDisplayNameFields(user);
  } catch (error) {
    strapi.log.warn(`Unable to resolve author name for admin user ${id}: ${error?.message ?? error}`);
    return undefined;
  }
}

export default {
  async afterCreate(event: StoryLifecycleEvent) {
    await ensureAuthorNameAfter(event);
  },
  async afterUpdate(event: StoryLifecycleEvent) {
    await ensureAuthorNameAfter(event);
  },
};

async function ensureAuthorNameAfter(event: StoryLifecycleEvent) {
  const { result } = event;
  if (!result) return;

  const actingUser = result.updatedBy ?? result.createdBy;
  const displayName =
    resolveDisplayNameFields(actingUser) ??
    (actingUser?.id ? await fetchDisplayNameById(actingUser.id) : undefined);

  if (!displayName) return;

  const currentAuthor = result.authorName;
  if (currentAuthor === displayName) return;

  await strapi.db.query('api::story.story').update({
    where: { id: result.id },
    data: { authorName: displayName },
  });
}
