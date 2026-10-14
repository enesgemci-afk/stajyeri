import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stajyeri.net - MESEM ve Meslek Lisesi Staj Platformu",
  description: "Geleceğin mesleğini sahada öğren, doğru staj yerini keşfet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-[#F8FAFC] text-slate-800 antialiased m-0 p-0">
        {children}
      </body>
    </html>
  );
}