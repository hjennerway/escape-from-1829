import {readFile,writeFile} from 'node:fs/promises';
const commands=JSON.parse(await readFile(new URL('../../package.json',import.meta.url))).scripts.test.split(' && '),remaining=JSON.parse(await readFile(new URL('remaining-suite.json',import.meta.url))),firstFailure=commands.indexOf('node test-jarman.mjs');
const result={commands:commands.length,passed:firstFailure+remaining.checks-remaining.failures.length,failed:1+remaining.failures.length,firstInvocation:{passingCommands:firstFailure,failed:'test-jarman.mjs'},remaining,baselineFailures:['test-jarman.mjs','test-leighton-newton.mjs']};
await writeFile(new URL('suite-summary.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({commands:result.commands,passed:result.passed,failed:result.failed}));
