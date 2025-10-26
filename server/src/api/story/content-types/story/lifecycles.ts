const SUPER_ADMIN_CODE = 'strapi-super-admin';

type UserLike = {
  username?: string;
  firstname?: string;
  lastname?: string;
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

function resolveDisplayName(user: UserLike | undefined): string | undefined {
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

  return undefined;
}

function ensureAuthorName(event: StoryLifecycleEvent) {
  const { params } = event;
  if (!params?.data) {
    return;
  }

  const actingUser = resolveActingUser(event);
  const displayName = resolveDisplayName(actingUser);

  if (!displayName) {
    return;
  }

  params.data.authorName = displayName;
}

export default {
  beforeCreate(event: StoryLifecycleEvent) {
    ensureAuthorName(event);
  },
  beforeUpdate(event: StoryLifecycleEvent) {
    ensureAuthorName(event);
  },
};
