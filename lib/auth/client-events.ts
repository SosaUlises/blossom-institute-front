export const CURRENT_USER_AVATAR_UPDATED_EVENT = 'current-user:avatar-updated'

export function emitCurrentUserAvatarUpdated(avatarUrl: string | null) {
  window.dispatchEvent(
    new CustomEvent<{ avatarUrl: string | null }>(
      CURRENT_USER_AVATAR_UPDATED_EVENT,
      { detail: { avatarUrl } },
    ),
  )
}
