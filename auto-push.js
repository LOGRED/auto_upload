import chokidar from 'chokidar';
import {sep} from 'path';
import axios from 'axios';


const detectFolder = 'C:/Users/sihan/OneDrive/문서/마음렌즈/Maumlenz/database/vision';

const watcher = chokidar.watch(detectFolder, {
    ignored: ['.git/**', 'node_modules/**'],
    ignoreInitial: true
});

watcher.on('change', async (path) => {
    if (path.endsWith('.xlsm')) {
        console.log(path.split(sep).pop());

        const form = new FormData();
        form.append('file', path);

        const response = await axios.post('https://dev.vision21tech.com/api/upload', form)

        console.log(response);
    }
});