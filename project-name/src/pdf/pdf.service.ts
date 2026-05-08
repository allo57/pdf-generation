/* Start server : 
 - pnpm run start:dev
 - http://localhost:3000/pdf/generate */

import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
    async generatePdf() {
        let pdfBuffer: Buffer = await new Promise(async (resolve) => {
            let PDFDocument = require('pdfkit-table');

            let doc = new PDFDocument({
                size: 'letter',
                bufferPages: true
            });

            let pageWidth = doc.page.width;
            let margin = 50;

            // Creation du contenu du PDF
            this.header(doc, pageWidth, margin);
            await this.body(doc);
            this.footer(doc);

            // Creation d'un buffer pour stocker les données du PDF
            let buffer = [];
            doc.on('data', buffer.push.bind(buffer));
            doc.on('end', () => {
                let data = Buffer.concat(buffer);
                resolve(data);
            });

            doc.end();
        });

        return pdfBuffer;
    }

    /* ============================
     * Génération de l'en-tête du PDF  
     * ============================ */
    async header(doc, pageWidth, margin) {
        // Company name
        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .text("NOVALEDGER STUDIOS", 50, 45);

        // Company details
        doc
            .fontSize(10)
            .font("Helvetica")
            .text("1457 Aurora Avenue", 50, 75)
            .text("Fiction City, FC 20488", 50, 90)
            .text("Email: billing@novaledger.example", 50, 105)
            .text("Phone: +1 (555) 018-4421", 50, 120);

        // Invoice title
        doc
            .fontSize(20)
            .font("Helvetica-Bold")
            .text("INVOICE", 400, 50, { align: "right" });

        // Invoice metadata
        doc
            .fontSize(10)
            .font("Helvetica")
            .text("Invoice No: INV-2026-001", 350, 85, { align: "right" })
            .text("Date: May 8, 2026", 350, 100, { align: "right" })
            .text("Due Date: May 22, 2026", 350, 115, { align: "right" });

        // Divider line
        doc
            .moveTo(50, 150)
            .lineTo(550, 150)
            .stroke();
    }

    /* ============================
     * Génération du corps du PDF  
     * ============================ */
    async body(doc) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:", 50, 170);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Orion Tech Solutions", 50, 185)
        .text("22 Crescent Boulevard", 50, 200)
        .text("Montreal, QC H2X 1Y4", 50, 215)
        .text("accounts@oriontech.example", 50, 230);

      const items = [
        ["Custom Web Application Development", "18", "$120.00", "$2,160.00"],
        ["UI/UX Design Package", "1", "$850.00", "$850.00"],
        ["Cloud Infrastructure Setup", "6", "$95.00", "$570.00"],
        ["Monthly Maintenance & Support", "1", "$300.00", "$300.00"],
      ];

      const subtotal = 3880;
      const tax = subtotal * 0.15;
      const total = subtotal + tax;

      const table = {
        headers: [
          { label: "Description", property: "description", width: 250 },
          { label: "Qty", property: "quantity", width: 60, align: "center" },
          { label: "Unit Price", property: "unitPrice", width: 90, align: "right" },
          { label: "Amount", property: "amount", width: 90, align: "right" },
        ],
        datas: items.map(([description, quantity, unitPrice, amount]) => ({
          description,
          quantity,
          unitPrice,
          amount,
        })),
      };

      await doc.table(table, {
        x: 50,
        y: 270,
        width: 500,
        prepareHeader: () => {
          doc.font("Helvetica-Bold").fontSize(10);
        },
        prepareRow: () => {
          doc.font("Helvetica").fontSize(10);
        },
      });

      let totalsY = doc.y + 20;

      // Prevent overflow into footer/page bottom
      if (totalsY > 520) {
          doc.addPage();
          totalsY = 80;
      }

      doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#000000")
          .text("Subtotal:", 390, totalsY, {
              width: 80,
              align: "right",
          })
          .text(`$${subtotal.toFixed(2)}`, 470, totalsY, {
              width: 70,
              align: "right",
          });

      doc
          .text("Tax 15%:", 390, totalsY + 20, {
              width: 80,
              align: "right",
          })
          .text(`$${tax.toFixed(2)}`, 470, totalsY + 20, {
              width: 70,
              align: "right",
          });

      // Total background
      doc
          .rect(390, totalsY + 45, 160, 30)
          .fill("#f3f3f3");

      // IMPORTANT: reset fill color after fill()
      doc.fillColor("#000000");

      doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text("TOTAL:", 400, totalsY + 55, {
              width: 70,
              align: "right",
          })
          .text(`$${total.toFixed(2)}`, 470, totalsY + 55, {
              width: 70,
              align: "right",
          });

      doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Notes", 50, totalsY + 110);

      doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#555555")
          .text(
              "Please include the invoice number in your payment reference. Payments can be made via bank transfer or corporate credit card.",
              50,
              totalsY + 125,
              { width: 500 }
          );

      doc.fillColor("#000000");
    }

    /* ============================
     * Génération du pied de page du PDF
     * ============================ */
    async footer(doc) {
        let footerTop = 635;
        // Divider line
        doc
            .moveTo(50, footerTop)
            .lineTo(550, footerTop)
            .strokeColor("#aaaaaa")
            .stroke();

        // Thank you message
        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#000000")
            .text(
            "Thank you for your business!",
            50,
            footerTop + 15,
            { align: "center", width: 500 }
            );

        // Payment terms
        doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor("#555555")
            .text(
            "Payment is due within 14 days. Late payments may incur additional fees.",
            50,
            footerTop + 35,
            { align: "center", width: 500 }
            );

        // Company registration info
        doc
            .fontSize(8)
            .text(
            "NOVALEDGER STUDIOS • Business ID: FC-884201 • VAT: FC204884",
            50,
            footerTop + 55,
            { align: "center", width: 500 }
            );

        // Website
        doc
            .fillColor("#1a73e8")
            .text(
            "www.novaledger.example",
            50,
            footerTop + 70,
            {
                align: "center",
                width: 500,
                link: "https://www.novaledger.example",
                underline: true,
            }
            );

        // Reset color
        doc.fillColor("#000000");
    }
}
