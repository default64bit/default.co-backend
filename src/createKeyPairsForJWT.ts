import { writeFile } from "fs/promises";
import { generateKeyPair } from "crypto";

export default async () => {
    generateKeyPair(
        "rsa",
        {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                cipher: "aes-256-cbc",
                passphrase: process.env.PRIVATE_KET_PASS,
            },
        },
        async (err, publicKey, privateKey) => {
            // Handle errors and use the generated key pair.
            if (err) console.log(err);
            if (err) return;

            await writeFile(`./storage/private/public_key.pem`, publicKey, { flag: "wx" }).catch((e) => console.log(e));
            await writeFile(`./storage/private/private_key.pem`, privateKey, { flag: "wx" }).catch((e) => console.log(e));
        },
    );
};
