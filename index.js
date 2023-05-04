#!/usr/bin/env node

import commander from "commander";
import { readFile, writeFile } from 'fs/promises';

commander.version("1.0.3")
	.usage("[options]")
	.description("Tool to report on packages missing `hasInstallScript` set in `package-lock.json`.  Optionally update the lock file.")
	.option("--debug",
		"trace extra scum messages")
	.option("--file-in <fileName>",
		"override JSON file to be read.  Mostly used for testing.",
		undefined)
	.option("--file <fileName>",
		"JSON file to be processed.",
		"package-lock.json")
	.option("--dry-run", "report missing entries only.  Do not update the lockfile.", false)
	.parse(process.argv);

const commandOptions = commander.opts();
const debugLog = (body) => {
	return console.log(body);
};
const nodebugLog = () => { };

const debug = commandOptions.debug ? debugLog : nodebugLog;

if (!commandOptions.fileIn) {
	commandOptions.fileIn = commandOptions.file;
}

(async () => {
	const lockFile = await getData(commandOptions.fileIn);
	let updated = false;
	if (lockFile.lockfileVersion && [2, 3].includes(lockFile.lockfileVersion)) {
		const packages = lockFile.packages;
		for (const entry in packages) {
			if (entry != "") {
				debug(`Checking ${entry}`);

				const depsEntry = packages[entry];
				if (!depsEntry.hasOwnProperty('hasInstallScript')) {
					try {
						const depsPackage = await getData(`${entry}/package.json`);

						if (depsPackage.hasOwnProperty('scripts') && (
							depsPackage.scripts.hasOwnProperty('install') ||
							depsPackage.scripts.hasOwnProperty('preinstall') ||
							depsPackage.scripts.hasOwnProperty('postinstall'))) {
							console.log(`Package '${depsPackage.name}' requires `+
							"'hasInstallScript' to be set");

							if (!commandOptions.dryRun) {
								packages[entry].hasInstallScript = true;
								updated = true;
							}
						}
					} catch(reason) {
						debug(`Failed on ${entry}`);
						if (reason.code === "ENOENT") {
							console.log(`package-lock.json may need rebuilding.  ${entry} not found.`);
						}
						else {
							throw reason;
						}
					}
				}
			}
		}

		if (updated) {
			await putData(commandOptions.file, lockFile);
		}
	} else {
		console.log('Only lockfileVersion 2 is supported');
		return;
	}
})().catch((reason) => {
	console.error(`Caught error: ${reason}`);
	process.exit(1);
});

async function getData( file ) {
	const rawdata = await readFile( file, 'utf8' );
	const records = JSON.parse( rawdata );
	return records;
}

async function putData( file, data ) {
	const recordsOut = JSON.stringify( data, null, 2 );
	await writeFile( file, recordsOut );
}