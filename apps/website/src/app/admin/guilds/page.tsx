import type { Metadata } from "next";

import { BitField } from "@mc/common/BitField";
import { UserPermissions } from "@mc/common/UserPermissions";

import { Errors } from "~/app/errors";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Manage Guilds - Member Counter" };
export default async function Page() {
  const authUser = await api.session.user();
  const userPerms = new BitField(authUser.permissions);

  if (
    userPerms.missing(UserPermissions.SeeGuilds | UserPermissions.ManageGuilds)
  )
    throw new Error(Errors.NotAuthorized);

  // TODO
}