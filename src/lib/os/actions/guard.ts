import "server-only";
import { getActor, requirePermission, type Actor } from "../actor";
import { friendlyError } from "../db";
import { fail, type ActionResult } from "../action-types";
import type { PermissionKey } from "../permissions";

/**
 * The wrapper every server action goes through.
 *
 * It resolves the acting employee, asserts the permission BEFORE the handler
 * reads a single field of its input, and turns anything thrown into a message
 * an employee can act on. A screen may hide a button, but this is where access
 * is actually decided — the button was never the boundary.
 */
export async function guarded<T>(
  permission: PermissionKey,
  handler: (actor: Actor) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const actor = await getActor();
    if (!actor) {
      return fail("You are signed out", "Sign in again to continue.");
    }
    if (actor.status === "suspended" || actor.status === "left") {
      return fail("This account is not active", "Speak to an administrator.");
    }
    requirePermission(actor, permission);
    return await handler(actor);
  } catch (error) {
    const friendly = friendlyError(error);
    return fail(friendly.title, friendly.detail);
  }
}
