import { UserForm } from "@/components/forms/UserForm";

export default function NewUserPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">사용자 신규 등록</h2>
                <p className="text-sm text-zinc-500">시스템에 새로운 사용자를 등록합니다.</p>
            </div>
            <UserForm />
        </div>
    );
}
