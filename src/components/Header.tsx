import Link from 'next/link';
import NextImage from 'next/image';
// Import the CSS module


export default function Header() {
  return (
    // Apply the 'header' class from the CSS module
    <header className="header">
      {/* Apply the 'container' class */}
      <div className="container">
        {/* Apply the 'logoLink' class */}
        <Link href="/" className="logoLink">
          <NextImage
            src="/logo.png" // Added a placeholder source
            alt="Ghar Se Kaam Logo"
            width={120}
            height={120}
            // Apply the 'logoImage' class
            className="logoImage"
          />
        </Link>
      </div>
    </header>
  );
}