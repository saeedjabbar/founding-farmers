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
  async beforeCreate(event: StoryLifecycleEvent) {
    synchronizeLegacyBlurb(event.params);
    const actingUser = resolveActingUser(event);
    await updateAuthorName(event.params, actingUser);
  },
  async beforeUpdate(event: StoryLifecycleEvent) {
    synchronizeLegacyBlurb(event.params);
    const actingUser = resolveActingUser(event);
    await updateAuthorName(event.params, actingUser);
  },
  async afterCreate(event: StoryLifecycleEvent) {
    await ensureAuthorNameAfter(event);
  },
  async afterUpdate(event: StoryLifecycleEvent) {
    await ensureAuthorNameAfter(event);
  },
};

function synchronizeLegacyBlurb(params: { data?: Record<string, any> }) {
  if (!params.data) return;

  const snippetText = extractPlainText(params.data.storySnippet);
  const blurbText = extractPlainText(params.data.storyBlurb);
  const legacyTextCandidate = typeof params.data.blurb === 'string' ? params.data.blurb : undefined;

  const resolvedText = (blurbText ?? snippetText ?? legacyTextCandidate)?.trim();
  if (resolvedText && resolvedText.length > 0) {
    params.data.blurb = resolvedText;
  }
}

function extractPlainText(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const parts: string[] = [];
  const nodes = value as Array<Record<string, any>>;

  const walk = (children: Array<Record<string, any>> | undefined) => {
    if (!children) return;
    for (const child of children) {
      if (!child) continue;
      if (typeof child.text === 'string' && child.text.trim().length > 0) {
        parts.push(child.text.trim());
      }
      if (Array.isArray(child.children)) {
        walk(child.children as Array<Record<string, any>>);
      }
    }
  };

  walk(nodes);

  if (!parts.length) {
    return undefined;
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

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
