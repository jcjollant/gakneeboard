import axios from 'axios'

export class Charts {
    private static async fetchPdf(url: string): Promise<Buffer> {
        try {
            const pdfResponse = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    // Some servers may require a user agent
                    'User-Agent': 'Mozilla/5.0',
                    // Accept PDF content
                    'Accept': 'application/pdf'
                }
            })
            console.log('[Charts.fetchPdf] url', url, 'status', pdfResponse.status)
            const pdfBuffer = Buffer.from(pdfResponse.data)
            // console.log('[Charts.fetchPdf] pdfBuffer', pdfBuffer.byteLength)
            return pdfBuffer
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('[Charts.fetchPdf] request failed', url, error.response.status);
                throw new Error(`request failed with status ${error.response.status}`);
            } else {
                console.error('[Charts.fetchPdf] request failed', url, error);
                throw new Error('request failed');
            }
        }
    }

    public static async getAeronavSupplement(filename: string): Promise<Buffer> {
        const url = `https://aeronav.faa.gov/afd/${filename}`
        return this.fetchPdf(url)
    }
    /**
     * Download PDF from aeronav
     * @param fileName File name including cycle path such as 2503/01234ILY16R.PDF
     * @returns pdf Buffer
     */
    public static async getAeronavTerminalProcedure(fileName: string): Promise<Buffer> {
        // console.log('[Charts.getAeronavTerminalProcedure] invoked with', cycle, fileName)

        const url = `https://aeronav.faa.gov/d-tpp/${fileName}`
        return this.fetchPdf(url)
    }

}