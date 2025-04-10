/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import { USERS } from "../data/users";
function formatTimestamp(timestamp: string): string {
  return dayjs(timestamp).format("MM/DD/YYYY HH:mm:ss");
}

async function exportToExcel(data: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Users");
  worksheet.columns = [
    { header: "Account Address", key: "accountAddress", width: 100 },
    { header: "Created At", key: "createdAt", width: 50 },
  ];

  data.forEach((us: any) => {
    worksheet.addRow({
      accountAddress: us.accountAddress,
      createdAt: formatTimestamp(us.createdAt.timestamp),
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function GET() {
  try {
    const buffer = await exportToExcel(USERS);
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
