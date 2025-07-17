import Image from "next/image";
import Link from "next/link";
import React from "react";
import NavlinkComponent from "@/component/navbar/NavlinkComponent";

const NavbarComponent = () => {
  return (
    // buat navbar
    <div className="fixed top-0 w-full bg-white shadow-sm z-20">
      <div className="max-w-screen-xl px-4 md:px-0 mx-auto flex flex-wrap items-center justify-between">
        <Link href="/">
          <Image src="/logo.PNG" alt="logo" width={128} height={49} priority />
        </Link>
        <NavlinkComponent />
      </div>
    </div>
  );
};

export default NavbarComponent;
