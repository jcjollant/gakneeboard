import { setTextRange } from "typescript";
import { Template } from "../models/Template"
import { FmdChecklist } from "./FmdChecklist"
import crypto from 'crypto'

enum KeyUsage {
  Encrypt = 'encrypt',
  Decrypt = 'decrypt',
}

export class FmdWriter {
  static CIPHER_BLOCK_SIZE:number = 16;
  static CIPHER_TYPE = 'AES-CBC';
  static CIPHER_KEY = Buffer.from('81e06e41a93f3848', 'ascii');

  public static async encodeTemplate(template:Template):Promise<ArrayBuffer> {
    const checklist:FmdChecklist = FmdChecklist.fromTemplate(template)
    // console.log('[FmdWriter.encodeTemplate] checklist', JSON.stringify(checklist))
    return FmdWriter.encode(checklist)
  }

  /**
    * transforms checklist into an FMD formatted ArrayBuffer
    * Checklist > Group > Subgroup > Item
    * @param checklist 
    * @returns 
    */
  public static async encode(checklist:FmdChecklist):Promise<ArrayBuffer> {
      const data:any = {
        type: 'checklist',
        payload: checklist
      }
      const strData:string = JSON.stringify(data)
      console.log('[FmdWriter.encode]', strData)

      // generate 16 random bytes
      const rb = new Uint8Array(FmdWriter.CIPHER_BLOCK_SIZE);
      const iv = crypto.getRandomValues(rb);
      const blah = new Blob(
        [
          iv,
          await crypto.subtle.encrypt(
            { name: FmdWriter.CIPHER_TYPE, iv: iv },
            await FmdWriter.getKey(KeyUsage.Encrypt),
            new TextEncoder().encode(strData),
          ),
        ],
        { type: 'application/octet-stream' },
      );

      return await blah.arrayBuffer();
  }

  public static async decode(source:ArrayBuffer):Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: FmdWriter.CIPHER_TYPE,
        iv: new Uint8Array(source.slice(0, FmdWriter.CIPHER_BLOCK_SIZE)),
      },
      await FmdWriter.getKey(KeyUsage.Decrypt),
      new Uint8Array(source.slice(FmdWriter.CIPHER_BLOCK_SIZE)),
    );
    return new TextDecoder().decode(new Uint8Array(decrypted));    
  }

  static async getKey(usage:KeyUsage):Promise<crypto.webcrypto.CryptoKey> {
    return crypto.subtle.importKey(
      'raw',
      FmdWriter.CIPHER_KEY,
      { name: FmdWriter.CIPHER_TYPE },
      false,
      [usage],
    );
  }

}