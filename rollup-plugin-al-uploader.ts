import http, {ClientRequest} from 'node:http'

require('dotenv').config();

// Holds the code from the previous build, will check uniqueness to avoid extra uploads //
let code: string;
// A boolean to avoid uploading on the first call //
let firstBuild = true;
// Will hold the request object to avoid multiple api calls //
let prevReq: ClientRequest;


function uploadFile(code: string, saveName: string, slot: number){
    console.log(process.env.AUTH_COOKIE)
    const req = http.request(
        {
          hostname: "adventure.land",
          path: "/api/save_code",
          method: "POST",
          headers: {
            Cookie: `auth=${process.env.AUTH_COOKIE}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
        (res) => {
          res.on("data", (response) => {
            console.log(response.toString())
            const asJson: {message: string}[] = JSON.parse(response.toString());
            console.log(`${saveName}: ${asJson[0].message}`);
          });
        }
      );
      req.on("error", (err) => {
        console.error("Error talking to the AL API:", err);
      });
  
      if (prevReq) {
        console.log("Aborted ongoing request..");
        prevReq.destroy();
      }
      prevReq = req
  
      // yes, the API is kind of convoluted.
      // pack it into a JSON object, stringify it and then encode such that
      // we do: /save_code?method=save_code?args=<URI encoded json object>
      const obj = {
        method: "save_code",
        arguments: JSON.stringify({
          slot: slot.toString(),
          code: code.toString(),
          name: saveName,
          log: "0",
        }),
      };
  
      req.write(new URLSearchParams(obj).toString());
      req.end();
}

export default function alUploader(){
    return {
        name: 'alUploader',
        generateBundle: (options: any, bundle: {[fileName: string]: any}) => {
          // console.log(code === bundle[0].code)
          let saveName;
          let saveSlot;
          for (const [fileName, data] of Object.entries(bundle)){
            const fileOptions = fileName.split('.')
            
            if (fileOptions.length === 3){
              // Destructure name and slot from split string //
              [saveName, saveSlot, ] = fileOptions
              // Convert saveSlot to Number //
              saveSlot = Number(saveSlot)
            } else {
              // Destructure name from split string //
              [saveName, ] = fileOptions;
              saveSlot = 3
            }

            // Check if code has changed, and this is not the initial build //
              // If yes, upload code //
            if(code !== data.code && !firstBuild){
              uploadFile(data.code, saveName, saveSlot)
            }
            code = data.code;
          }
          firstBuild = false;
          // console.log('options: ', options,'bundle: ', bundle)
          // code = bundle[0].code
            // uploadFile(bundle['ranger.js'].code, 'ranger', 3)
        }
    }
}