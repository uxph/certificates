import jsPDF from "jspdf";

const generate = async ({ certName = "" }) => {
  return await new Promise(async (resolve) => {
    const doc = new jsPDF("l", "mm", "a4"); // todo compress PDF specs

    try {
      // Load Poppins Bold font from the public directory
      const fontResponse = await fetch('/fonts/Poppins/Poppins-Bold.ttf');
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      
      // Convert ArrayBuffer to base64 string more efficiently
      const uint8Array = new Uint8Array(fontArrayBuffer);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const fontBase64 = btoa(binaryString);
      
      doc.addFileToVFS("Poppins-Bold.ttf", fontBase64);
      
      // Add the font to jsPDF with the actual font data
      doc.addFont("Poppins-Bold.ttf", "Poppins", "bold");

      doc.addImage("/templates/certificates/davao.png", "PNG", 0, 0, 297, 210);

      // Set font to Poppins Bold
      doc.setFont("Poppins", "bold");
      doc.setFontSize(36);
      doc.setTextColor("#221192");
      doc.text(certName.toUpperCase(), 297 / 2, 210 / 2 + 5, "center"); // todo position the name properly

      resolve(
        doc.save(
          `UXPH Conf 2025 Certificate of Attendance - ${certName
            .split(" ")
            .map(
              (x) => x[0].toUpperCase() + x.substring(1, x.length).toLowerCase()
            )
            .join(" ")}.pdf`
        )
      );
    } catch (error) {
      console.error("Error loading Poppins font:", error);
      // Fallback to helvetica if font loading fails
      doc.addImage("/templates/certificates/davao.png", "PNG", 0, 0, 297, 210);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(45);
      doc.setTextColor("#221192");
      doc.text(certName.toUpperCase(), 297 / 2, 210 / 2 + 10, "center");

      resolve(
        doc.save(
          `UXPH Conf 2025 Certificate of Attendance - ${certName
            .split(" ")
            .map(
              (x) => x[0].toUpperCase() + x.substring(1, x.length).toLowerCase()
            )
            .join(" ")}.pdf`
        )
      );
    }
  });
};

export default generate;
