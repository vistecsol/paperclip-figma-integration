// Execute in the already capped preparation container, never on the Mac host.
import fs from 'node:fs';
import {validateDnsReceipt} from './qualification-dns.mjs';
const [receiptPath,run]=process.argv.slice(2);
console.log(validateDnsReceipt(JSON.parse(fs.readFileSync(receiptPath,'utf8')),{run}).join('\n'));
