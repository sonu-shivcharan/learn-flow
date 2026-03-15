import { UserButton } from "@clerk/nextjs";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 flex items-center bg-white shadow-sm px-4">
        <div className="flex w-full justify-end">
            <UserButton />
        </div>
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
          <div className="p-6 flex items-center justify-center font-bold text-xl text-blue-600">
            LearnFlow
          </div>
          <div className="flex flex-col w-full">
            {/* Sidebar routes will go here */}
            <div className="p-4 bg-blue-50/50 text-blue-700 font-medium text-sm flex items-center cursor-pointer hover:bg-blue-100/50 transition">
              Dashboard
            </div>
            <div className="p-4 text-zinc-500 font-medium text-sm flex items-center cursor-pointer hover:bg-zinc-100 transition">
              Browse
            </div>
          </div>
        </div>
      </div>
      <main className="md:pl-56 pt-[80px] h-full">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;
