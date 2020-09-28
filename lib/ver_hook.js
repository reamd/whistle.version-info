#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const { exec } = require('child_process');

const generateVersion = (oldDate, preNewDate) => {
    let res = `${preNewDate}00`;
    const oldPre = oldDate.substr(0, 6);
    const oldSuffix = oldDate.substr(6);
    if (preNewDate === oldPre) {
        const newSuffix = String(Math.min(Number(oldSuffix) + 1, 99)).padStart(2, '0');
        res = `${preNewDate}${newSuffix}`;
    }
    console.log('***当前版本号***:', res, '\n');
    return res;
};

// 版本信息及命令行描述
program.version('v' + require('./package.json').version, '-v, --version')
    .description('version info hook')

// 
program.command('run <version-path> [file]')
    .description('version info hook start')
    .action(function(versionPath, file) {
        versionPath += '/version.json';
        const date = new Date();
        const newVersionPre = `${String(date.getFullYear()).substr(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        exec("git symbolic-ref --short HEAD", { encoding: 'utf-8' }, (error, stdout, stderr) => {
            const branch = stdout.replace(/\n/g, '');
            if (fs.existsSync(versionPath)) {
                const verInfo = fs.readFileSync(versionPath, 'utf-8');
                const verObj = JSON.parse(verInfo);
                fs.writeFileSync(versionPath, JSON.stringify({
                    version: generateVersion(verObj.version, newVersionPre),
                    branch,
                }, null, 2), 'utf-8');
            } else {
                fs.writeFileSync(versionPath, JSON.stringify({
                    version: generateVersion('00000000', newVersionPre),
                    branch,
                }, null, 2), 'utf-8');
            }

            if (file) {
                exec(`node ${file}`, { encoding: 'utf-8' }, (error, stdout, stderr) => {
                    return;
                })
            }
        })
    });

program.parse(process.argv)

if (program.args.length === 0) {
    program.help()
}