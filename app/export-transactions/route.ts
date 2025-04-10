/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import { TRANSACTIONS } from "@/app/data/data";
function formatTimestamp(timestamp: string): string {
  return dayjs(timestamp).format("MM/DD/YYYY HH:mm:ss");
}

async function exportToExcel(data: any, type: "All" | "Memories") {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");
  worksheet.columns = [
    { header: "Version", key: "version", width: 15 },
    { header: "Timestamp", key: "timestamp", width: 22 },
    { header: "Sender", key: "sender", width: 100 },
    { header: "Function", key: "function", width: 50 },
  ];
  worksheet.autoFilter = {
    from: "A1",
    to: "D1",
  };
  let transactionsData = data;
  if (type === "Memories") {
    transactionsData = data.filter(
      (tx: any) => tx.function === "red_package::seal_memory"
    );
  }
  transactionsData.forEach((tx: any) => {
    worksheet.addRow({
      version: tx.transaction_version,
      timestamp: formatTimestamp(tx.user_transaction.timestamp),
      sender: tx.user_transaction.sender,
      function: tx.function,
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "All" | "Memories";
    const buffer = await exportToExcel(TRANSACTIONS, type);
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="transactions.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return new Response("Error exporting transactions", { status: 500 });
  }
}
