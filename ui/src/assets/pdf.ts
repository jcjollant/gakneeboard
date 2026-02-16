import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';


export async function createPDF(elements: NodeListOf<Element>, landscape: boolean): Promise<Blob> {
  // console.debug('[pdf.exportToPDF]', elements.length, landscape);


  if (!elements.length) {
    console.error('[pdf.exportToPDF] Element not found');
    throw new Error('Element not found');
  }

  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'in',
    format: 'letter'
  });

  const margin = 0.25
  const longSide = 11
  const shortSide = 8.5
  const pageWidth = landscape ? longSide : shortSide;
  const printableWidth = pageWidth - 2 * margin;
  const pageHeight = landscape ? shortSide : longSide;
  const printableHeight = pageHeight - 2 * margin;

  const printApectRatio = printableWidth / printableHeight;

  // console.debug('[pdf.exportToPDF] WxH', pageWidth, pageHeight)

  let imageCount = 0;
  for (const element of elements) {
    // add a page if
    if (imageCount > 0) pdf.addPage();

    const canvas = await html2canvas(element as HTMLElement, {
      scale: 2,
      allowTaint: true,
      useCORS: true,
      // proxy: "https://cloudfront.foreflight.com",
      // onclone: (doc) => {
      //   let span;
      //   for(span of doc.getElementsByClassName('coverImage')) {
      //     console.debug('[pdf.exportToPDF] coverImage', span)
      //     // get first child img element 
      //     const img = span.querySelector('img');
      //     // console.debug('[pdf.exportToPDF] coverImage', img)
      //     // img.src = "https://cloudfront.foreflight.com/diagrams/2508/f70.jpg"
      //     // img.src += '&t=' + Date.now()
      //     // img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/500px-Google_2015_logo.svg.png"
      //     img.crossOrigin = 'anonymous'

      //     console.debug('[pdf.exportToPDF] img', img)
      //   }
      // } 
    });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    // console.debug('[pdf.exportToPDF] image', imgProps.width, imgProps.height)
    const imgAspectRatio = imgProps.width / imgProps.height;
    let scaledWidth = printableWidth;
    let scaledHeight = printableHeight;
    if (printApectRatio < imgAspectRatio) {
      // Reduce height to scale
      scaledHeight = printableHeight * printApectRatio / imgAspectRatio;
    } else if (printApectRatio > imgAspectRatio) {
      // Reduce width to scale
      scaledWidth = printableWidth * imgAspectRatio / printApectRatio;
    }
    // center image
    const xOffset = margin + (printableWidth - scaledWidth) / 2
    const yOffset = margin + (printableHeight - scaledHeight) / 2
    // const scaledWidth = printableHeight * imgProps.width / imgProps.height;
    // console.debug('[pdf,exportToPDF] scaledW', scaledWidth, 'scaledH', scaledHeight, 'printableW', printableWidth, 'printableH', printableHeight)
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
    imageCount++;
  }

  return pdf.output('blob');
}

export async function exportToPDF(elements: NodeListOf<Element>, landscape: boolean, filename?: string): Promise<void> {
  const blob = await createPDF(elements, landscape);
  const url = URL.createObjectURL(blob);

  if (filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    window.open(url, '_blank'); // Open PDF in a new browser tab
  }
}