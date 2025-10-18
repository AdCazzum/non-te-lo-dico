import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-3 md:px-0">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🔐 Secure File Sharing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload encrypted files to IPFS with FHE-protected decryption keys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Upload Card */}
        <Link 
          href="/upload"
          className="bg-white shadow-lg rounded-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📤</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload File</h2>
            <p className="text-gray-600">
              Encrypt and upload files to IPFS, then share them securely
            </p>
          </div>
        </Link>

        {/* Retrieve Card */}
        <Link 
          href="/retrieve"
          className="bg-white shadow-lg rounded-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Retrieve File</h2>
            <p className="text-gray-600">
              Access and decrypt files that have been shared with you
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8 text-center max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">How it works</h3>
        <ol className="text-left text-gray-700 space-y-2">
          <li>1️⃣ Upload: Encrypt your file and upload to IPFS</li>
          <li>2️⃣ Secure: Encryption key is protected with ZAMA FHE</li>
          <li>3️⃣ Share: Grant access to specific addresses</li>
          <li>4️⃣ Retrieve: Authorized users can decrypt and view the file</li>
        </ol>
      </div>
    </div>
  );
}
