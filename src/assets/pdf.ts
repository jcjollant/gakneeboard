import { on } from 'events';

export async function exportToPDF(elements:NodeListOf<Element>, onePagePerSheet:boolean): Promise<void> {
    // console.log('[pdf.exportToPDF]', elements.length);

    const [{ jsPDF }, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
  
    const html2canvas = html2canvasModule.default;
  
    if (!elements.length) {
      console.error('[pdf.exportToPDF] Element not found');
      return;
    }
  
    const pdf = new jsPDF({
        orientation: onePagePerSheet ? 'portrait' : 'landscape',
        unit: 'in',
        format: 'letter'
      });

    const margin = 0.25
    const longSide = 11
    const shortSide = 8.5
    const pageHeight = onePagePerSheet ? longSide : shortSide;
    const pageWidth = onePagePerSheet ? shortSide : longSide;
    const printableWidth = pageWidth - 2 * margin;
    const printableHeight = pageHeight - 2 * margin;
 
    let imageCount = 0;
    for( const element of elements) {
        // add a page if
        if( imageCount > 0) pdf.addPage();

        const canvas = await html2canvas(element as HTMLElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const aspectRatio = imgProps.width / imgProps.height;
        const scaledHeight = printableWidth * imgProps.height / imgProps.width;
        const scaledWidth = printableHeight * imgProps.width / imgProps.height;
        if( onePagePerSheet) {
            const xOffset = (printableWidth - scaledWidth) / 2
            pdf.addImage(imgData, 'PNG', margin + xOffset, margin, scaledWidth, printableHeight);
        } else {
            pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, scaledHeight);
        }
        imageCount++;
    }
  
    // At the end of exportToPDF
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank'); // Open PDF in a new browser tab
    
  }