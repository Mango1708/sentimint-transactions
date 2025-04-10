import { UserNav } from "@/views/nav";
import { Transactions } from "@/views/transactions";
import { Users } from "@/views/users";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Image
            src={"/logo.svg"}
            width={228}
            height={43}
            priority
            alt="Sentimint logo"
          />
          </div>
          <div className="hidden items-center space-x-2 md:flex">
            <UserNav />
          </div>
        </div>
        <div className="font-semibold tracking-tight text-2xl mb-2">Transactions</div>
        <Transactions />
        <div className="font-semibold tracking-tight text-2xl mb-2">Users</div>
        <Users/> 
      </div>
    
  );
}
