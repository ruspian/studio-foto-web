import { Raleway } from "next/font/google";
import "./globals.css";
import NavbarComponent from "@/component/navbar/NavbarComponent";
import FooterComponent from "@/component/FooterComponent";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata = {
  title: "Home",
  description: "Shoot moment terbaikmu di Studio Foto kami",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`}>
        <NavbarComponent />
        {children}
        <FooterComponent />
      </body>
    </html>
  );
}
