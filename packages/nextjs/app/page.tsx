import Link from "next/link";
import { Icon } from "~~/components/Icon";

export default function Home() {
  return (
    <main className="section-padding">
      <div className="container-minimal">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 items-center">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)] border border-[var(--color-primary)]">
              <Icon name="lock" size={16} className="text-black" />
              <span className="text-sm font-medium text-black">Privacy-First Data Sharing</span>
            </div>
          </div>

          <h1 className="mb-6 text-5xl md:text-6xl font-bold">
            Share AI Training Data
            <br />
            <span className="text-[var(--color-primary)]">Without Compromising Privacy</span>
          </h1>

          <p
            className="text-xl text-muted max-w-3xl mx-auto leading-relaxed"
            style={{
              justifySelf: "center",
            }}
          >
            <span className="font-semibold text-[var(--color-primary)]">non-te-lo-dico</span> is a decentralized
            platform for securely sharing datasets with trusted AI companies and researchers. Using ZAMA&apos;s Fully
            Homomorphic Encryption and blockchain technology, you maintain complete control over who can access your
            data.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link href="/upload" className="btn-primary px-8 py-4 text-lg flex items-center gap-2">
              <Icon name="upload" size={20} />
              Upload Dataset
            </Link>
            <Link href="/retrieve" className="btn-outline px-8 py-4 text-lg flex items-center gap-2">
              <Icon name="download" size={20} />
              Retrieve Data
            </Link>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Icon name="shield" size={28} className="text-black" />
              </div>
              <h3 className="mb-3 text-center">End-to-End Encryption</h3>
              <p className="text-sm text-muted text-center">
                Your data is encrypted client-side before upload. Decryption keys are protected using ZAMA&apos;s FHE
                technology on the blockchain.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Icon name="user" size={28} className="text-black" />
              </div>
              <h3 className="mb-3 text-center">Selective Access Control</h3>
              <p className="text-sm text-muted text-center">
                Grant decryption rights only to specific Ethereum addresses you trust. Revocable and fully transparent
                on-chain.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Icon name="globe" size={28} className="text-black" />
              </div>
              <h3 className="mb-3 text-center">Decentralized Storage</h3>
              <p className="text-sm text-muted text-center">
                Files are stored on IPFS, ensuring permanence and availability without relying on centralized servers.
              </p>
            </div>
          </div>
        </div>

        {/* How it Works - Visual Stepper */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p
              className="text-lg text-muted max-w-2xl mx-auto self-center"
              style={{
                justifySelf: "center",
              }}
            >
              A simple, secure workflow for sharing sensitive data with trusted parties
            </p>
          </div>

          {/* Stepper Flow */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-primary)] to-transparent transform -translate-x-1/2"></div>

            {/* Step 1 - Data Owner */}
            <div className="relative mb-16">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:text-right">
                  <div className="card p-8">
                    <div className="flex md:justify-end mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold text-xl">
                        1
                      </div>
                    </div>
                    <h3 className="mb-3">Upload & Encrypt Your Dataset</h3>
                    <p className="text-sm text-muted mb-4">
                      As a data owner, you upload text files containing valuable training data. The file is
                      automatically encrypted on your device using a randomly generated key.
                    </p>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        Client-Side Encryption
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        IPFS Upload
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex md:w-16 justify-center z-10">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-primary)]">
                    <Icon name="upload" size={24} className="text-[var(--color-primary)]" />
                  </div>
                </div>
                <div className="md:w-1/2"></div>
              </div>
            </div>

            {/* Step 2 - Blockchain Storage */}
            <div className="relative mb-16">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2"></div>
                <div className="hidden md:flex md:w-16 justify-center z-10">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-primary)]">
                    <Icon name="shield" size={24} className="text-[var(--color-primary)]" />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="card p-8">
                    <div className="flex mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold text-xl">
                        2
                      </div>
                    </div>
                    <h3 className="mb-3">FHE-Protected Key Storage</h3>
                    <p className="text-sm text-muted mb-4">
                      The encryption key is protected using ZAMA&apos;s Fully Homomorphic Encryption and stored
                      on-chain. The IPFS link to your encrypted file is also recorded in the smart contract.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        ZAMA FHE
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        Smart Contract
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 - Grant Access */}
            <div className="relative mb-16">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:text-right">
                  <div className="card p-8">
                    <div className="flex md:justify-end mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold text-xl">
                        3
                      </div>
                    </div>
                    <h3 className="mb-3">Grant Selective Access</h3>
                    <p className="text-sm text-muted mb-4">
                      You control who can decrypt your data by granting access to specific Ethereum wallet addresses.
                      Share a link only with trusted AI companies or researchers you choose.
                    </p>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        ACL Grants
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)} border border-[var(--color-border)]">
                        Wallet-Based Auth
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex md:w-16 justify-center z-10">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-primary)]">
                    <Icon name="key" size={24} className="text-[var(--color-primary)]" />
                  </div>
                </div>
                <div className="md:w-1/2"></div>
              </div>
            </div>

            {/* Step 4 - Data Consumer */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2"></div>
                <div className="hidden md:flex md:w-16 justify-center z-10">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-primary)]">
                    <Icon name="unlock" size={24} className="text-[var(--color-primary)]" />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="card p-8">
                    <div className="flex mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold text-xl">
                        4
                      </div>
                    </div>
                    <h3 className="mb-3">Decrypt & Access Data</h3>
                    <p className="text-sm text-muted mb-4">
                      Authorized recipients connect their wallet and retrieve the decryption key through ZAMA&apos;s ACL
                      system. The file is downloaded from IPFS and decrypted client-side for immediate use.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        FHE Decryption
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        Privacy Preserved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-4xl font-bold">Perfect For</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                  <Icon name="brain" size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="mb-2">AI Training Data Providers</h3>
                  <p className="text-sm text-muted">
                    Safely monetize your datasets by sharing them with AI companies you trust, without exposing
                    sensitive information to unauthorized parties.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                  <Icon name="users" size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="mb-2">Research Institutions</h3>
                  <p className="text-sm text-muted">
                    Collaborate on sensitive research data with guaranteed privacy controls, ensuring compliance with
                    data protection regulations.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                  <Icon name="building" size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="mb-2">Enterprise Data Sharing</h3>
                  <p className="text-sm text-muted">
                    Share proprietary datasets with business partners while maintaining cryptographic proof of access
                    control and data sovereignty.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                  <Icon name="medical" size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="mb-2">Healthcare & Compliance</h3>
                  <p className="text-sm text-muted">
                    Share medical or personal data for research purposes with guaranteed privacy, perfect for GDPR and
                    HIPAA compliance requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto text-center">
          <div className="card p-12 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-secondary)]">
            <h2 className="mb-4 text-3xl font-bold">Ready to Share Data Securely?</h2>
            <p className="text-lg text-muted mb-8">
              Join the privacy-first data sharing revolution powered by blockchain and FHE technology
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link href="/upload" className="btn-primary px-8 py-4 flex items-center gap-2">
                <Icon name="upload" size={20} />
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
