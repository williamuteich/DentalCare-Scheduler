import { getServerSession } from "next-auth";
import { auth as authOptions} from "@/lib/auth-config";
import { redirect } from 'next/navigation';
import Sidebar from "./components/sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !session;

  if (isLoggedIn) {
      redirect("/");
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
