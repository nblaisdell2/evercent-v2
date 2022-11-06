import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";

function Header() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="bg-blue-900 text-white text-xl py-1 flex justify-between font-cinzel items-center">
      <div className="ml-2 flex items-center">
        <Image
          src="/evercent_logo.png"
          className="object-contain"
          width={35}
          height={35}
          alt="My Logo"
        />
        <div className="ml-1">EverCent</div>
      </div>
      <div>{user ? "Welcome, " + user.nickname : "Welcome"}</div>
      <div className="mr-2 hover:underline">
        {user ? (
          <Link href={"/api/auth/logout"}>Log out</Link>
        ) : (
          <Link href={"/api/auth/login"}>Log in</Link>
        )}
      </div>
    </div>
  );
}

export default Header;
