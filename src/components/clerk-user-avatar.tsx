"use client"

import { UserButton } from "@clerk/nextjs"

export function ClerkUserAvatar() {
    return (
        <UserButton afterSignOutUrl="/" />
    )
}
// "use client";

// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";

// export function ClerkUserAvatar() {
//   const { user } = useUser();
//   const router = useRouter();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Avatar>
//           <AvatarImage src={user?.imageUrl || ""} />
//           <AvatarFallback>{user?.firstName?.[0] ?? "U"}</AvatarFallback>
//         </Avatar>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent>
//         <DropdownMenuItem onClick={() => router.push("/profile")}>
//           Profile
//         </DropdownMenuItem>
//         <DropdownMenuItem
//           onClick={async () => {
//             await user?.signOut(); // ✅ sign out directly from the user object
//             router.push("/sign-in");
//           }}
//         >
//           Logout
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
