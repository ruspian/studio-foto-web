"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";

const NavlinkComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center p-2 justify-center text-sm text-gray-500 rounded-md md:hidden hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <IoClose className="size-8" />
        ) : (
          <IoMenu className="size-8" />
        )}
      </button>

      <div
        className={clsx("w-full md:block md:w-auto", {
          hidden: !isOpen,
        })}
      >
        <ul className="flex flex-col font-semibold text-sm uppercase p-4 mt-4 rounded-sm bg-gray-50 md:flex-row md:items-center md:space-x-10 md:p-0 md:mt-0 md:border-0 md:bg-white">
          <li>
            <Link
              href="/"
              className="block py-2 px-3 text-gray-800 hover:bg-gray-100 rounded-sm md:hover:bg-transparent md:p-0"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/cetak"
              className="block py-2 px-3 text-gray-800 hover:bg-gray-100 rounded-sm md:hover:bg-transparent md:p-0"
            >
              Cetak
            </Link>
          </li>
          <li>
            <Link
              href="/upload"
              className="block py-2 px-3 text-gray-800 hover:bg-gray-100 rounded-sm md:hover:bg-transparent md:p-0"
            >
              Upload
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default NavlinkComponent;
