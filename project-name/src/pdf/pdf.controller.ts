import { Controller, Get, Res } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get("generate")
  async generatePdf(@Res() res) {
    let pdfBuffer = await this.pdfService.generatePdf();

    // Définir les en-têtes de la réponse pour indiquer qu'il s'agit d'un fichier PDF
    res.set({
      'Content-Type': 'application/pdf',
      //'Content-Disposition': 'attachment; filename=generated.pdf',  // Indique que le fichier doit être téléchargé avec le nom "generated.pdf"
      'Content-Length': pdfBuffer.length,
    });
    
    // Envoyer le buffer PDF en réponse
    res.end(pdfBuffer);
  }
}
  