const fs = require('fs');
const { exec } = require('child_process');
const program = require('commander');
const config = require('../package.json');

const versionFilePath = './version.json';

program
    .version(config.version)
    .parse(process.argv);

// exec promise化
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
    exec(cmd, {encoding: 'utf-8'}, (error, stdout, stderr) => {
        if (error !== null) {
        console.log('exec error: ' + error)
        reject(error);
        } else {
        resolve(stdout);
        }
    });
    });
}

// 版本生成函数
const generateVersion = (oldDate, preNewDate) => {
    let res = `${preNewDate}00`;
    const oldPre = oldDate.substr(0, 6);
    const oldSuffix = oldDate.substr(6);
    if (preNewDate === oldPre) {
        const newSuffix = String(Math.min(Number(oldSuffix) + 1, 99)).padStart(2, '0');
        res = `${preNewDate}${newSuffix}`;
    }
    return res;
};

// 获取当前版本分支
const getCurrBranch = async () => {
    const res = await execPromise('git symbolic-ref --short HEAD')
    return res.replace('\n', '');
};

// 版本version.json生成
fs.exists(versionFilePath, async (res) => {
    const date = new Date();
    const newVersionPre = `${String(date.getFullYear()).substr(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const branch = await getCurrBranch();
    if (res) {
        const verInfoText = fs.readFileSync(versionFilePath, 'utf-8');
        const verInfo = JSON.parse(verInfoText);
        const fOldVersion = verInfo.version;
        const newVersion = generateVersion(fOldVersion, newVersionPre);        
        const wVerInfo = Object.assign(verInfo, { 
            version: newVersion,
            branch,
        });
        fs.writeFileSync(
            versionFilePath,
            JSON.stringify(wVerInfo, null, 2),
            (err) => {},
        );
    } else {
        fs.writeFileSync(
            versionFilePath,
            JSON.stringify({
                "version": `${newVersionPre}00`,
                branch
            }, null, 2),
            (err) => {},
        );
    }
});
