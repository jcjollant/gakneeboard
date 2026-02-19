import { put } from "@vercel/blob";
import { AirportDao } from "./AirportDao";
import { Airport } from "./models/Airport";
import axios from "axios";

export class AirportSketch {
  static doesNotExist = "dne";

  static async get(airportCode: string, pdf: string, skipSave: boolean = false): Promise<string> {
    console.log("[AirportSketch.get] invoked for", airportCode, pdf);

    try {
      // Get PDF from aeronav
      const pdfName = pdf;

      // extract sketch from PNG
      const response = await axios.post(
        "https://gak-sketcher.vercel.app/api",
        // "http://localhost:3001/api",
        { pdf: pdf },
        {
          headers: { "Content-Type": "image/png" },
          responseType: "arraybuffer",
        })
      console.log("[AirportSketch.get] completed for", airportCode, "size", response.data.length);

      if (skipSave) {
        console.log("[AirportSketch.get] skipping save for", airportCode);
        return "";
      }
      return await AirportSketch.save(airportCode, response.data);
    } catch (error) {
      console.log("[AirportSketch.get] failed for", airportCode, error);
      throw error;
    }
  }

  /**
   * Refresh airport sketch
   * @param airport 
   * @param code Airport code, which may differ from airport.code
   * @param skipGet Allows to skip the get if instrument approach is found
   * @returns 
   */
  static async resolve(airport: Airport, code: string = undefined, skipGet: boolean = false) {
    console.log("[AirportSketch.hook] invoked for", airport.code);

    const airportCode = code ?? airport.code

    if (!airport.iap || airport.iap.length < 1) {
      console.log("[AirportSketch.hook] no IAP for", airportCode);
      await AirportSketch.notFound(airportCode);
      airport.sketch = AirportSketch.doesNotExist;
    } else if (!skipGet) {
      const sketch = await AirportSketch.get(airportCode, airport.iap[0].pdf)
      airport.sketch = sketch
    }
  }

  /**
   * Update airport in DB with not found code
   * @param airportCode
   * @returns
   */
  static async notFound(airportCode: string) {
    // console.log('[AirportSketch.notFound] invoked with', airportCode)
    if (!airportCode) return;

    await AirportDao.updateSketch(airportCode, AirportSketch.doesNotExist).then(
      () => {
        console.log("[AirportSketch.notFound] completed for", airportCode);
      }
    );
  }


  /**
   * Save sketch to Blob and update Airport DB record
   * @param airport
   * @param pngBuffer
   * @returns
   */
  static async save(airportCode: string, pngBuffer: Buffer): Promise<string> {
    const code = airportCode;
    try {
      const blob = await put(`sketch/${code}.png`, pngBuffer, {
        access: "public",
        contentType: "image/png",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      // save url with associated airport
      await AirportDao.updateSketch(code, blob.url)
      console.log("[AirportSketch.save] uploaded", blob.url);
      return blob.url;
    } catch (err) {
      console.log("[AirportSketch.save] failed for ", code, err);
      throw err;
    }
  }
}
