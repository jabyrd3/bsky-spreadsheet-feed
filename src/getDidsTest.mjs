import { GoogleSpreadsheet } from 'google-spreadsheet';
import axios from 'axios';
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet('1mCZQ382IvNAs2mGAO97YJ1cb8jvKpMM3O4CL1OyYhvI');
  doc.useApiKey('AIzaSyCQJDDafLmclAhfaPYjKfpAxR8SzRu1iPU')
  await doc.loadInfo(); // loads sheets


  const sheet = doc.sheetsByIndex[0] 
  const sheetBuffer = await sheet.downloadAsCSV();
  const csv = sheetBuffer.toString();
  const lines = csv.split('\n').slice(1)

  function parseLine(line) {
    const lineSplit = line.trim().split(',').map(cell => cell.trim());
    return lineSplit.slice(-1)[0];
  }

  const handles = lines.map(parseLine)
    .filter(a => a.length)
    .filter(a => !a.includes(" "))
    .map(handle => handle.includes('.') ? handle : `${handle}.bsky.social`)

  const didList = await Promise.all(handles.filter(
    handle => handle.indexOf("#") !== 0)
    .map(handle => {
      try {
        const raw = axios.get(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`)
        return raw;
      } catch (e) {
        console.log('failed pulling ', handle)
        return ""
      }
    }))
  console.log(didList.map(result => result.data.did))
