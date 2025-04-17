/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { ONCHAIN_USER } from "../data/onchain-user";


async function exportToExcel(data: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Onchain-Users");
  worksheet.columns = [
    { header: "Account Address", key: "address", width: 100 },
  ];

  data.forEach((us: any) => {
    worksheet.addRow({
        address: us.address
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function GET() {
  try {
    const buffer = await exportToExcel(ONCHAIN_USER);
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="users.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return new Response("Error exporting users", { status: 500 });
  }
}
