import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookSquare,
  FaGithub,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

const FooterComponent = () => {
  return (
    <footer className="bg-gray-50 border border-t-1">
      <div className="max-w-screen-xl mx-auto px-4 w-full py-10 md:py-16">
        <div className="flex flex-col md:flex-row justify-between gap-5 px-6">
          {/* logo */}
          <div className="">
            <Link href="/" className="mb-2 block">
              <Image src="/logoHitam.png" alt="logo" width={128} height={49} />
            </Link>
            <p className="text-gray-600 text-xs">
              Abadikan kenangan lo di studio foto kami
            </p>
          </div>
          <div className="">
            <div className="flex flex-col">
              {/* links */}
              <h4 className="mb-2 text-xl font-semibold text-gray-900">
                Sosial Media
              </h4>
              <div className="flex text-gray-600 gap-4">
                {/* <div className="list-item space-y-5 text-gray-400"> */}
                <p>
                  <Link href="/">
                    <FaFacebookSquare className="size-5 hover:text-emerald-800" />
                  </Link>
                </p>
                <p>
                  <Link href="/">
                    <FaInstagram className="size-5 hover:text-emerald-800" />
                  </Link>
                </p>
                <p>
                  <Link href="/">
                    <FaTiktok className="size-5 hover:text-emerald-800" />
                  </Link>
                </p>

                {/* </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 border-t border-gray-500 py-8 text-center text-base text-gray-500">
        <div className="flex items-center justify-center gap-6">
          <p>&copy; App Developer : Ruspian Majid</p>
          <div className="flex text-gray-600 gap-2">
            <p>
              <Link href="https://github.com/ruspian">
                <FaGithub className="size-4 hover:text-emerald-800" />
              </Link>
            </p>
            <p>
              <Link href="https://www.instagram.com/p.abe_">
                <FaInstagram className="size-4 hover:text-emerald-800" />
              </Link>
            </p>
            <p>
              <Link href="https://wa.me/6282293308893">
                <FaWhatsapp className="size-4 hover:text-emerald-800" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
