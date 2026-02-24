import { query } from "@/lib/db";
import { UserForm } from "@/components/forms/UserForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditUserPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];

    if (!user) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">사용자 정보 수정</h2>
                <p className="text-sm text-zinc-500">사용자의 인사 정보를 수정합니다.</p>
            </div>
            <UserForm initialData={user} isEdit />
        </div>
    );
}
