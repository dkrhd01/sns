import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * @file page.tsx
 * @description 내 프로필 페이지
 *
 * /profile 접근 시 현재 사용자의 프로필로 리다이렉트
 */

export default async function MyProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 현재 사용자의 프로필로 리다이렉트
  redirect(`/profile/${userId}`);
}

