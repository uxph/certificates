import jsPDF from "jspdf";

const generate = async ({ certName = "" }) => {
    return await new Promise((resolve) => {
        const doc = new jsPDF("l", "mm", "a4"); // todo compress PDF specs
        doc.addImage("/templates/certificates/sample.jpg", "PNG", 0, 0, 297, 210);
        doc.setFontSize(45);
        doc.setTextColor("#E8006F");
        doc.text(certName.toUpperCase(), 297 / 2, 210 / 2 + 20, "center"); // todo position the name properly
        resolve(
            doc.save(
                `UXPH Conf 2025 Certificate of Attendance - ${certName
                    .split(" ")
                    .map((x) => x[0].toUpperCase() + x.substring(1, x.length).toLowerCase())
                    .join(" ")}.pdf`
            )
        );
    });
};

export default generate;
