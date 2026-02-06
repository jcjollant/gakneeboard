import axios from 'axios'

export class Charts {
    /**
     * Download PDF from aeronav
     * @param cycleAndFileName Cycle and File name such as 2503/01234ILY16R.PDF
     * @returns pdf Buffer
     */
    public static async getAeronavTerminalProcedure(cycle: string, fileName: string): Promise<Buffer> {
        // console.log('[Charts.getAeronavTerminalProcedure] invoked with', cycle, fileName)

        const url = `https://aeronav.faa.gov/d-tpp/${cycle}/${fileName}`
        try {
            // console.log('[Charts.getAeronavTerminalProcedure] before axios', url)
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
            console.log('[Charts.getAeronavTerminalProcedure] url', url, 'status', pdfResponse.status)
            const pdfBuffer = Buffer.from(pdfResponse.data)
            // console.log('[GApi.getAeronavTerminalProcedure] pdfBuffer', pdfBuffer.byteLength)
            return pdfBuffer
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log('[Charts.getAeronavTerminalProcedure] request failed', url, error.response.status);
                throw new Error(`request failed with status ${error.response.status}`);
            } else {
                console.log('[Charts.getAeronavTerminalProcedure] request failed', url, error);
                throw new Error('request failed');
            }
        }
    }

}