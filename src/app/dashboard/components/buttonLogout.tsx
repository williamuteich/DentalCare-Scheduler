"use client";
import { signOut } from "next-auth/react";

export default function ButtonLogout() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-red-600 hover:underline"
    >
      Sair
    </button>
  );
}
