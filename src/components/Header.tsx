import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center">
        {/* Simple Hamburger Icon */}
        <div className="mr-4 text-2xl cursor-pointer">☰</div>
        <Link href="/" className="text-xl font-bold">
          GHAR-se-KAAM
        </Link>
      </div>
      <div className="flex items-center">
        {/* Sign In / Login */}
        <Link href="/admin/login" className="flex items-center text-sm">
          SIGN_IN/LOGIN
          <span className="ml-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"></span>
        </Link>
      </div>
    </header>
  );
}