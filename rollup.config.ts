import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
//requiring path and fs modules
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import alUploader from './rollup-plugin-al-uploader';

interface SaveSlot {
  name?: string;
  slot?: number;
  message?: string
}

interface SaveMap {
  [fileName: string]: SaveSlot
}

//joining path of directory 
const directoryPath = path.join(__dirname, 'src/uploads');


async function getUploadFiles() {
  const saveMap: SaveMap = {}
  try {
    // Get a list of files in the uploads directory //
    const files = await fs.readdir(directoryPath)

    // Files should be saved in the format [saveName].[saveSlot].js //
    files.forEach((file, index) => {
      const fileOptions = file.split('.')
      let saveName;
      let saveSlot;
      if (fileOptions.length === 3){
        // Destructure name and slot from split string //
        [saveName, saveSlot, ] = fileOptions
        // Convert saveSlot to Number //
        saveSlot = Number(saveSlot)
        saveMap[`./src/uploads/${file}`] = {name: saveName, slot: saveSlot}
      } else {
        saveMap[`./src/uploads/${file}`] = {message: 'Please save your files in the format: [saveName].[saveSlot].ts'};
      }
    })
  } catch(err){
    console.error(err)
  } finally {
    return saveMap
  }
}

// Need to return a separate config for each file //
  // This way the files are not code split //
export default (async () => {
  const saveMap = await getUploadFiles()
  const configs = []
  for (const save in saveMap) {
    if (!saveMap[save].message) {
      configs.push({
        input: save,
        output: {
          format: 'cjs',
          file: `build/${saveMap[save].name}.js`,
        },
        plugins: [
          typescript(),
          resolve(),
          commonjs(),
          alUploader()
        ],
      })
    } else {
      console.error(saveMap[save].message) 
      console.error('Skipping: ' + save)
    }
  }
  return configs
})()