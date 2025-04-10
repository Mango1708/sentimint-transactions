export const dynamic = 'force-static'
import { JSONFile } from 'lowdb/node'
import { Low } from 'lowdb'

interface UserTransaction {
  sender: string;
}

interface Transaction {
  user_transaction: UserTransaction;
  transaction_version: string; 
}

interface GraphQLResponse {
  data: {
    account_transactions: Transaction[];
  };
}

interface DataSchema {
  transactions: Transaction[];
}

const adapter = new JSONFile<DataSchema>("transactions.json");
const db = new Low<DataSchema>(adapter, {
  transactions: []
});

async function initDB() {
  await db.read();
  db.data ||= { transactions: [] };
}
  
const ENDPOINT = "https://indexer.testnet.movementnetwork.xyz/v1/graphql";
const LIMIT = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchTransactions(offset: number): Promise<Transaction[]> {
  const query = `query MyQuery {
  account_transactions(
    where: {
      account_address: { _eq: "0x556b39a90e8e86bc27dce1e9f25a794e2c41407091d52cd3788f9e5971e48727" },
      user_transaction: {}
    }
    limit: ${LIMIT}
    offset: ${offset}
  ) {
    user_transaction {
      sender
      entry_function_id_str
      timestamp
    }
    transaction_version
  }
}`;

  const headers = {
    "accept": "application/json, multipart/mixed",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "origin": "https://cloud.hasura.io",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "referer": "https://cloud.hasura.io/",
    "sec-ch-ua": `"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": `"macOS"`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
  };

  const body = {
    query,
    operationName: "MyQuery"
  };

  while (true) {
    try {
      console.log(`Fetching transactions with offset: ${offset}`);
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: GraphQLResponse = await response.json();
      return json.data.account_transactions;
    } catch (error) {
      console.error(`fetch transactions with offset ${offset}: ${error}`);
      await sleep(60000);
    }
  }
}
export async function GET() {
  try {
    return Response.json({ data:'done' })
    console.log("------START------")
    await initDB();
    let offset = 0;
    while (true) {
      console.log(`Fetching transactions with offset: ${offset}`);
      const transactions = await fetchTransactions(offset);
      if (transactions.length === 0) {
        console.log("Done");
        break;
      }
      db.data!.transactions.push(...transactions);
      await db.write();
      console.log(`Have been stored ${transactions.length}, ${db.data!.transactions.length}`);

      offset += transactions.length;
    }
    console.log("------END------")
    return Response.json({ data:'111' })
  } catch (error) {
    console.error("", error);
  }
  
}