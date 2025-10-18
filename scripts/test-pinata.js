#!/usr/bin/env node

/**
 * Test script per verificare la configurazione di Pinata
 *
 * Utilizzo:
 * node scripts/test-pinata.js
 */

const fs = require("fs");
const path = require("path");

async function testPinataConnection() {
  console.log("🔍 Verifica configurazione Pinata...\n");

  // Check if .env exists
  const envPath = path.join(__dirname, "../packages/nextjs/.env");
  const envLocalPath = path.join(__dirname, "../packages/nextjs/.env.local");

  let envFile = null;
  if (fs.existsSync(envLocalPath)) {
    envFile = envLocalPath;
    console.log("✅ Trovato file .env.local");
  } else if (fs.existsSync(envPath)) {
    envFile = envPath;
    console.log("✅ Trovato file .env");
  } else {
    console.log("❌ Nessun file .env trovato");
    console.log("   Crea un file .env in packages/nextjs/ copiando .env.example\n");
    return false;
  }

  // Read .env file
  const envContent = fs.readFileSync(envFile, "utf-8");
  const jwtMatch = envContent.match(/NEXT_PUBLIC_PINATA_JWT=(.+)/);

  if (!jwtMatch || !jwtMatch[1] || jwtMatch[1] === "your_pinata_jwt_token_here" || jwtMatch[1].trim() === "") {
    console.log("❌ NEXT_PUBLIC_PINATA_JWT non configurato");
    console.log("   Aggiungi il tuo JWT token al file .env\n");
    console.log("   Per ottenere un JWT token:");
    console.log("   1. Vai su https://app.pinata.cloud");
    console.log("   2. Crea un account (gratuito)");
    console.log('   3. Genera una API Key con permesso "pinFileToIPFS"');
    console.log("   4. Copia il JWT e aggiungilo al file .env\n");
    return false;
  }

  const jwt = jwtMatch[1].trim();
  console.log(`✅ JWT configurato (${jwt.substring(0, 20)}...)\n`);

  // Test connection to Pinata
  console.log("🔄 Test connessione a Pinata...");

  try {
    const testData = JSON.stringify({ test: "connection" });
    const blob = Buffer.from(testData);

    const FormData = (await import("form-data")).default;
    const fetch = (await import("node-fetch")).default;

    const formData = new FormData();
    formData.append("file", blob, { filename: "test.json" });

    const metadata = JSON.stringify({
      name: "connection-test.json",
    });
    formData.append("pinataMetadata", metadata);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Connessione riuscita!");
      console.log(`   File di test caricato con CID: ${data.IpfsHash}\n`);

      // Try to unpin the test file
      try {
        await fetch(`https://api.pinata.cloud/pinning/unpin/${data.IpfsHash}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        console.log("✅ File di test rimosso\n");
      } catch (_e) {
        console.log("⚠️  Non è stato possibile rimuovere il file di test\n");
      }

      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ Errore di connessione");
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Dettagli: ${errorText}\n`);

      if (response.status === 401) {
        console.log("   Il JWT token non è valido o è scaduto");
        console.log("   Genera un nuovo token da Pinata\n");
      }

      return false;
    }
  } catch (error) {
    console.log("❌ Errore durante il test");
    console.log(`   ${error.message}\n`);
    return false;
  }
}

// Run test
testPinataConnection()
  .then(success => {
    if (success) {
      console.log("✅ Configurazione Pinata completata e funzionante!");
      console.log("   Puoi ora caricare file su IPFS dall'applicazione.\n");
      process.exit(0);
    } else {
      console.log("❌ Configura Pinata per continuare.");
      console.log("   Consulta PINATA_SETUP.md per istruzioni dettagliate.\n");
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("❌ Errore imprevisto:", error);
    process.exit(1);
  });
