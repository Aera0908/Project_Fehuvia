import dns from "dns";

const domains = [
  "google.com",
  "github.com",
  "rpc-testnet.morphl2.io",
  "rpc-holesky.morphl2.io",
  "rpc.holesky.morphl2.io",
  "rpc.testnet.morphl2.io",
  "rpc-quicknode.morph.network",
  "rpc-hoodi.morph.network",
  "dbzajnoixrqamxmrjpkj.supabase.co",
  "db.dbzajnoixrqamxmrjpkj.supabase.co"
];

function checkDns(domain) {
  return new Promise((resolve) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) {
        console.log(`❌ ${domain}: FAILED (Error: ${err.code})`);
      } else {
        console.log(`✅ ${domain}: RESOLVED -> ${address} (IPv${family})`);
      }
      resolve();
    });
  });
}

async function main() {
  console.log("\n=========================================");
  console.log("DNS NAME RESOLUTION DIAGNOSTIC RUN");
  console.log("=========================================\n");

  for (const domain of domains) {
    await checkDns(domain);
  }
  
  console.log("\n=========================================");
}

main();
