import { put } from "@vercel/blob";
import { AirportDao } from "./AirportDao";
import { Airport } from "./models/Airport";
import axios from "axios";
import { Charts } from "./Charts";
import { Canvas, createCanvas } from "canvas";

// Manually set up a fake worker
const fakeWorker = async () => {
  return {
    port: {
      postMessage: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    },
  };
};

export class AirportSketch {
  static doesNotExist = "dne";

  static async get(airportCode: string, pdf:string): Promise<string> {
    console.log("[AirportSketch.get] invoked for", airportCode, pdf);

    try {
        // Get PDF from aeronav
        const pdfName = pdf;
        const pdfBuffer = await Charts.getAeronavPdf(pdfName);
        // .teh.catch((error) => {
        //   // console.log('[AirportSketch.get] failed to get', pdfName, error)
        //   throw new Error(`failed to get ${pdfName} from aeronav`);
        // });
        console.log( "[AirportSketch.get] found pdf", pdfName, "length", pdfBuffer.length);

        // turn PDF into PNG
        const pngBuffer = await AirportSketch.pdfFirstPageToPng(pdfBuffer);
        console.log("[AirportSketch.get] created png size", pngBuffer.length);

        // extract sketch from PNG
        const response = await axios.post(
            "https://gak-sketcher.vercel.app/api", 
            pngBuffer, {
            headers: { "Content-Type": "image/png" },
            responseType: "arraybuffer",
          })
        console.log( "[AirportSketch.get] completed for", airportCode, "size", response.data.length);
        return await AirportSketch.save(airportCode, response.data);
    } catch (error) {
        console.log("[AirportSketch.get] failed for", airportCode, error);
        throw error;
    }
  }

  /**
   * Refresh airport sketch
   * @param airport 
   * @param code 
   * @returns 
   */
  static async resolve(airport:Airport, code:string=undefined) {
    console.log("[AirportSketch.hook] invoked for", airport.code);

    const airportCode = code ?? airport.code

    if (!airport.iap || airport.iap.length < 1) {
      console.log("[AirportSketch.hook] no IAP for", airportCode);
      await AirportSketch.notFound(airportCode);
      airport.sketch = AirportSketch.doesNotExist;
    } else {
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

  static async pdfFirstPageToPng(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.min.mjs")

      // Works in dev
      // const value = 'pdfjs-dist/legacy/build/pdf.worker.min.mjs'
      // works when copied to public
      // const value = '/pdf.worker.min.mjs'
      // const value = 'https://ga-api-seven.vercel.app/pdf.worker.min.mjs'
      // const value = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs'
      // const value = new URL(`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`).toString();
      // const value = new URL(`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`).toString();
      // const value = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      // const value = 'pdf.worker.min.mjs'
      // const value = '//ga-api-seven.vercel.app/pdf.worker.min.mjs'
      // const value = workerPath
      // const value = `${process.cwd()}/node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs`
      // const value = '';
      // console.log('[AirportSketch.pdfFirstPageToPng] worker', value);
      // pdfjs.GlobalWorkerOptions.workerSrc = value
      pdfjs.GlobalWorkerOptions.workerPort = null
      // pdfjs.GlobalWorkerOptions.workerPort = fakeWorker();
      const scale = 300 / 72;
      const compression = 5; // Default compression level

      // Load the PDF from buffer
      const pdf = await pdfjs.getDocument({
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
    } catch( err) {
        console.log("[AirportSketch.save] failed for ", code, err);
        throw err;
    }
  }
}
