import chokidar from 'chokidar';
import {sep} from 'path';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const detectFolder = '/Users/seonghyeoning/Documents/hi';

console.log("에이전트가 켜졌습니다!")

if (!fs.existsSync(detectFolder)) {
    console.error('폴더가 존재하지 않습니다:', detectFolder);
    process.exit(1);
}

const watcher = chokidar.watch(detectFolder, {
    ignored: ['.git/**', 'node_modules/**', '**/.DS_Store'],
    ignoreInitial: true,
    usePolling: false, // 맥OS에서는 false가 일반적으로 더 좋음
    awaitWriteFinish: { // 파일 쓰기 완료 대기
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

watcher.on('ready', () => {
    console.log('에이전트 준비완료');
});

watcher.on('change', async (filePath) => {
    if (filePath.endsWith('.xlsm')) {
        const baseName = filePath.split('_M')[0];
        const directory = path.dirname(filePath);
        const baseFileName = path.basename(baseName);

        try {
            const files = fs.readdirSync(directory);

            // 정확히 같은 이름으로 시작하는 파일들만
            const matchingFiles = files.filter(file => {
                // 파일명에서 확장자 제거 후 비교
                const fileNameWithoutExt = path.parse(file).name;
                return fileNameWithoutExt.startsWith(baseFileName);
            });

            console.log(`매칭되는 파일들 (총 ${matchingFiles.length}개):`);
            const form = new FormData();
            matchingFiles.forEach((file, index) => {
                const fullPath = path.join(directory, file);
                form.append('file', fs.createReadStream(fullPath));
            });
            const response = await axios.post('https://dev.vision21tech.com/api/upload_e', form)
            if (response.status === 200) {
                console.log('서버로 성공적으로 데이터를 보냈습니다');
            } else {
                console.log('서버 응답 오류:', response.status);
            }
        } catch (err) {
            console.error('파일 목록 읽기 실패:', err.message);
        }
    }
});