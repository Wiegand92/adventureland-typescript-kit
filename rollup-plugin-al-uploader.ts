import http, { ClientRequest } from 'node:http';

require('dotenv').config();

// Holds the code from the previous build, will check uniqueness to avoid extra uploads //
// Naive option, figure out how to check hash name //
const codeMap: { [fileName: string]: string } = {};

// Will hold the request object to avoid multiple api calls //
const reqMap: { [saveName: string]: ClientRequest } = {};

function uploadFile(code: string, saveName: string, slot: number) {
  const req = http.request(
    {
      hostname: 'adventure.land',
      path: '/api/save_code',
      method: 'POST',
      headers: {
        Cookie: `auth=${process.env.AUTH_COOKIE}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    res => {
      res.on('data', response => {
        const asJson: { message: string }[] = JSON.parse(response.toString());
        console.log(`${saveName}: ${asJson[2].message}`);
      });
    },
  );
  req.on('error', err => {
    console.error('Error talking to the AL API:', err);
  });

  if (reqMap[saveName]) {
    console.log('Aborted ongoing request..');
    reqMap[saveName].destroy();
  }
  reqMap[saveName] = req;

  // yes, the API is kind of convoluted.
  // pack it into a JSON object, stringify it and then encode such that
  // we do: /save_code?method=save_code?args=<URI encoded json object>
  const obj = {
    method: 'save_code',
    arguments: JSON.stringify({
      slot: slot.toString(),
      code: code.toString(),
      name: saveName,
      log: '0',
    }),
  };

  req.write(new URLSearchParams(obj).toString());
  req.end();
}

export default function alUploader() {
  return {
    name: 'alUploader',
    generateBundle: (options: any, bundle: { [fileName: string]: any }) => {
      let saveName;
      let saveSlot;
      for (const [fileName, data] of Object.entries(bundle)) {
        // Original FileName is the last part of the facadeModuleId //
        const fileOptions: string[] = data.facadeModuleId
          .split('/')
          .pop()
          .split('.');
        // Destructure name and slot from split string //
        [saveName, saveSlot] = fileOptions;
        // Convert saveSlot to Number //
        saveSlot = Number(saveSlot);
        // Check if code has changed, and this is not the initial build //
        // If yes, upload code //
        console.log(codeMap[saveName] === data.code);
        if (codeMap[saveName] && codeMap[saveName] !== data.code) {
          uploadFile(data.code, saveName, saveSlot);
        }
        codeMap[saveName] = data.code;
      }
    },
  };
}
