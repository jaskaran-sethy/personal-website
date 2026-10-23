// Zips extension/ into public/insight-extractor-extension.zip so the Insight Extractor page can offer it as a
// download. Runs before dev and build. A tiny uncompressed (stored) zip writer, so no dependency is needed.

import {readdirSync, readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const SOURCE = "extension";
const TARGET = "public/insight-extractor-extension.zip";

const CRC_TABLE = Array.from({length: 256}, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

const locals = [];
const centrals = [];
let offset = 0;
for (const name of readdirSync(SOURCE).sort()) {
    const data = readFileSync(join(SOURCE, name));
    const path = Buffer.from(`insight-extractor-extension/${name}`);
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034B50, 0);
    local.writeUInt16LE(10, 4); // Version needed
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(path.length, 26);
    locals.push(local, path, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014B50, 0);
    central.writeUInt16LE(20, 4); // Version made by
    central.writeUInt16LE(10, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(path.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, path);

    offset += local.length + path.length + data.length;
}

const directory = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054B50, 0);
end.writeUInt16LE(centrals.length / 2, 8);
end.writeUInt16LE(centrals.length / 2, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);

writeFileSync(TARGET, Buffer.concat([...locals, directory, end]));
console.log(`Wrote ${TARGET}`);
