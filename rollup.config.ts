import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
//requiring path and fs modules
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import alUploader from './rollup-plugin-al-uploader';

interface SaveSlot {
  name: string;
  slot: number;
}

//joining path of directory 
const directoryPath = path.join(__dirname, 'src/uploads');


async function getUploadFiles() {
  const saveMap: { [filename: string]: SaveSlot } = {}
  try {
    // Get a list of files in the uploads directory //
    const files = await fs.readdir(directoryPath)

    // Sort directory in case slots are not defined //
    files.sort();

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
      } else {
        // Destructure name from split string //
        [saveName, ] = fileOptions
        saveSlot = index + 1;
      }
      saveMap[`./src/uploads/${file}`] = {name: saveName, slot: saveSlot}
    })
  } catch(err){
    throw(err)
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
    configs.push({
      input: save,
      output: {
        format: 'cjs',
        file: `build/${saveMap[save].name}.js`,
        plugins: [alUploader()]
      },
      plugins: [
        typescript(),
        resolve(),
        commonjs(),
      ],
    })
  }
  return configs
})()