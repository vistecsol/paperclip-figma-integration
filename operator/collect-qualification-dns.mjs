// Run only in credential-free, capped preparation container in an approved session.
// DNS requests only. Receipt expires at earliest TTL, capped at five minutes.
import {resolve4,lookup,getServers} from 'node:dns/promises';
import {collectDnsReceipt} from './qualification-dns.mjs';
const [run,guardPath]=process.argv.slice(2);
const timeout=setTimeout(()=>process.exit(2),10000);
try { console.log(JSON.stringify(await collectDnsReceipt({run,guardPath,resolve4,lookup,resolvers:getServers()}))); }
finally { clearTimeout(timeout); }
