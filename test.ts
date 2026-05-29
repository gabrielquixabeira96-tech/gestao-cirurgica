import { parseOffice } from 'officeparser';
import * as path from 'path';

async function test() {
  const publicDir = path.join(process.cwd(), 'public');
  const file1 = path.join(publicDir, 'CIRMARC.docx');
  const file2 = path.join(publicDir, 'Fechamento de Faringostoma.docx');
  
  try {
    const res1 = await parseOffice(file1);
    console.log("CIRMARC:", res1.toText().substring(0, 50));
  } catch (e) {
    console.error("error 1", e);
  }
  
  try {
    const res2 = await parseOffice(file2);
    console.log("Fechamento:", res2.toText().substring(0, 50));
  } catch (e) {
    console.error("error 2", e);
  }
}
test();
