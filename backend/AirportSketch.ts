import { put } from "@vercel/blob";
import { AirportDao } from "./AirportDao";
import { Airport } from "./models/Airport";
import axios from "axios";
import { Charts } from "./Charts";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.min.mjs";
import { Canvas, createCanvas } from "canvas";

export class AirportSketch {
  static doesNotExist = "dne";

  static async get(airport: Airport): Promise<string> {
    console.log("[AirportSketch.get] invoked for", airport.code);

    if (!airport.iap || airport.iap.length < 1) {
        await AirportSketch.notFound(airport.code);
        return AirportSketch.doesNotExist;
    }

    try {
        // Get PDF from aeronav
        const pdfName = airport.iap[0].pdf;
        const pdfBuffer = await Charts.getAeronavPdf(pdfName);
        // .teh.catch((error) => {
        //   // console.log('[AirportSketch.get] failed to get', pdfName, error)
        //   throw new Error(`failed to get ${pdfName} from aeronav`);
        // });
        console.log( "[AirportSketch.get] found pdf", pdfName, "length", pdfBuffer.length);

        // turn PDF into PNG
        const pngBuffer = await AirportSketch.pdfFirstPageToPng(pdfBuffer);
        console.log("[AirportSketch.get] created png size", pngBuffer.length);

        // save PNG file to disk
        // await fs.writeFile('temp.png', pngBuffer)
       

        // extract sketch from PNG
        const response = await axios.post(
            "https://gak-sketcher.vercel.app/api", 
            pngBuffer, {
            headers: { "Content-Type": "image/png" },
            responseType: "arraybuffer",
          })
        console.log( "[AirportSketch.get] completed for", airport.code, "size", response.data.length);
        return await AirportSketch.save(airport, response.data);
    } catch (error) {
        console.log("[AirportSketch.get] failed for", airport.code, error);
        throw error;
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

  static async pdfFirstPageToPng(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs");
      const scale = 300 / 72;
      const compression = 5; // Default compression level

      // Load the PDF from buffer
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
      }).promise;

      // Get the page
      const page = await pdf.getPage(1);

      // Get viewport with scale
      const viewport = page.getViewport({ scale });

      // Create a canvas with the page dimensions
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Set white background (PDF pages can be transparent)
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Render the page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Get PNG as buffer with specified compression
      const pngBuffer = canvas.toBuffer("image/png", {
        compressionLevel: compression,
        filters: Canvas.PNG_FILTER_NONE,
      });
      return pngBuffer;
    } catch (error) {
      console.error(
        "[AirportSketch.pdfFirstPageToPng] Error converting PDF to PNG:",
        error
      );
      throw error;
    }
  }

  /**
   * Save sketch to Blob and update Airport DB record
   * @param airport
   * @param pngBuffer
   * @returns
   */
  static async save(airport: Airport, pngBuffer: Buffer): Promise<string> {
    const code = airport.code;
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
    } catch( err) {
        console.log("[AirportSketch.save] failed for ", code, err);
        throw err;
    }
  }
}
