import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";

function Header() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="bg-blue-900 text-white text-base sm:text-xl font-cinzel py-1 flex justify-between items-center">
      <div className="flex items-center">
        <div className="h-8 sm:h-10 w-8 sm:w-10 relative ml-2">
          <Image
            src="/evercent_logo.png"
            objectFit="contain"
            layout="fill"
            alt="My Logo"
          />
        </div>
        <div className="ml-1">EverCent</div>
      </div>

      <div className="text-center">
        {user ? "Welcome, " + user.nickname : "Welcome"}
      </div>

      <div className="whitespace-nowrap mr-1 sm:mr-2 hover:underline">
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
