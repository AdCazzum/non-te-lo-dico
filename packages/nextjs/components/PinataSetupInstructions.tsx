"use client";

export function PinataSetupInstructions() {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">Pinata IPFS non configurato</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Per caricare file su IPFS è necessario configurare un token Pinata JWT.
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Configurazione rapida:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                Crea un account gratuito su{" "}
                <a
                  href="https://app.pinata.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Pinata Cloud
                </a>
              </li>
              <li>
                Vai nella sezione <strong>API Keys</strong>
              </li>
              <li>
                Crea una nuova chiave con permesso <strong>pinFileToIPFS</strong>
              </li>
              <li>Copia il JWT token fornito</li>
              <li>
                Crea un file <code className="bg-gray-100 px-1 rounded">.env</code> in{" "}
                <code className="bg-gray-100 px-1 rounded">packages/nextjs/</code>
              </li>
              <li>
                Aggiungi: <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_PINATA_JWT=tuo_jwt_qui</code>
              </li>
              <li>Riavvia il server di sviluppo</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <a
              href="https://app.pinata.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm"
            >
              🔑 Ottieni API Key Pinata
            </a>
            <a
              href="https://github.com/AdCazzum/non-te-lo-dico/blob/master/PINATA_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
            >
              📖 Guida Completa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
