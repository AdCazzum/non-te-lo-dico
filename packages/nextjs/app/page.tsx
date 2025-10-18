import Link from "next/link";
import { Icon } from "~~/components/Icon";

export default function Home() {
  return (
    <main className="section-padding">
      <div className="container-minimal">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="mb-6">
            Secure File Sharing
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Upload encrypted files to IPFS with FHE-protected decryption keys.
            Share files securely with cryptographic access control.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
          <Link 
            href="/upload"
            className="card p-10 group hover:scale-[1.02] transition-transform"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-secondary)] group-hover:bg-[var(--color-foreground)] transition-colors">
                <Icon 
                  name="upload" 
                  size={28} 
                  className="group-hover:text-white transition-colors"
                />
              </div>
              <div>
                <h3 className="mb-2">Upload File</h3>
                <p className="text-sm">
                  Encrypt and upload files to IPFS, then share them securely with specific addresses
                </p>
              </div>
            </div>
          </Link>

          <Link 
            href="/retrieve"
            className="card p-10 group hover:scale-[1.02] transition-transform"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-secondary)] group-hover:bg-[var(--color-foreground)] transition-colors">
                <Icon 
                  name="download" 
                  size={28} 
                  className="group-hover:text-white transition-colors"
                />
              </div>
              <div>
                <h3 className="mb-2">Retrieve File</h3>
                <p className="text-sm">
                  Access and decrypt files that have been shared with you
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* How it Works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-foreground)] font-medium">
                1
              </div>
              <div>
                <h4 className="mb-2">Upload & Encrypt</h4>
                <p className="text-sm text-muted">
                  Select your file and it will be encrypted client-side before uploading to IPFS
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-foreground)] font-medium">
                2
              </div>
              <div>
                <h4 className="mb-2">Secure Storage</h4>
                <p className="text-sm text-muted">
                  Encryption key is protected using ZAMA's Fully Homomorphic Encryption
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-foreground)] font-medium">
                3
              </div>
              <div>
                <h4 className="mb-2">Grant Access</h4>
                <p className="text-sm text-muted">
                  Share the file link with specific Ethereum addresses to grant decryption rights
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-foreground)] font-medium">
                4
              </div>
              <div>
                <h4 className="mb-2">Decrypt & View</h4>
                <p className="text-sm text-muted">
                  Authorized users can retrieve and decrypt the file using their wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
