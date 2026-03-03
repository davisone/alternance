"use client";

import { signOut, useSession } from "next-auth/react";

export const UserMenu = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-3">
      {session?.user?.image && (
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full"
        />
      )}
      <span className="text-sm font-medium text-gray-700">
        {session?.user?.name}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Déconnexion
      </button>
    </div>
  );
};
