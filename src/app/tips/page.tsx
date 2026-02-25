'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Anchor,
    Waves,
    ArrowLeft,
    ShieldCheck,
    Wind,
    Droplets,
    Archive,
    Search
} from 'lucide-react';
import Image from 'next/image';

export default function TipsPage() {
    const router = useRouter();

    const tips = [
        {
            title: "효율적인 피복 관리 전략",
            icon: <ShieldCheck className="h-6 w-6 text-[#EE1C23]" />,
            description: "좁은 함내 공간에서 멀티 수납함과 압축 보관 기술을 활용하여 피복의 형태를 보존하고 가동 공간을 확보하세요.",
            details: [
                "함상 전투복(샘브레이/당가리)은 세탁 후 즉시 건조하여 습기 방지",
                "좁은 사물함 최적화를 위한 롤링 수납법 권장",
                "염분 제거를 위한 정기적인 특수 세정 가이드 준수"
            ]
        },
        {
            title: "함상 안전 신발 가이드",
            icon: <Wind className="h-6 w-6 text-[#EE1C23]" />,
            description: "철제 데크와 잦은 흔들림 속에서 미끄럼 방지가 강화된 단화와 함상 전용 운동화 착용으로 안전을 확보하세요.",
            details: [
                "이함 시 비상 대응을 위한 슬립온 스타일 활동화 최적화",
                "미끄럼 방지(Anti-Slip) 규격 인증 제품 우선 보급 확인",
                "수시 데크 청소 시 방수 성능 점검 필수"
            ]
        },
        {
            title: "스마트 포인트 보급 시스템 활용",
            icon: <Archive className="h-6 w-6 text-[#EE1C23]" />,
            description: "디지털 피복 시스템을 통해 잔여 포인트를 확인하고, 필요한 시기에 맞춰 전역 및 부대 이동 시기를 고려한 전략적 신청을 진행하세요.",
            details: [
                "포인트 이월 규정 및 소멸 시기 모바일 알림 설정",
                "부대 이동 전 '바다로 서비스' 신청으로 무료 배송 혜택 수혜",
                "시즌별 기능성 의류(동계 점퍼/스웨터) 사전 예약제 이용"
            ]
        },
        {
            title: "위생 및 환경 적응 팁",
            icon: <Droplets className="h-6 w-6 text-[#EE1C23]" />,
            description: "함정 내 밀폐된 환경에서 건강을 지키기 위한 위생 관리 규칙과 기능성 의류의 올바른 세탁법을 숙지하십시오.",
            details: [
                "공동 세탁실 사용 에티켓 및 살균 건조기 활용법",
                "기능성 내의(Cool-Dry)의 흡습속건 성능 유지를 위한 전용 세제 사용",
                "격오지/도서 지역 근무 시 비상 긴급 보급 신청 채널 확인"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col">
            {/* Minimal Header */}
            <header className="border-b border-zinc-100 px-6 py-4 shrink-0 bg-white sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="bg-[#EE1C23] text-white p-2 w-12 h-12 flex flex-col items-center justify-center font-bold leading-none shrink-0 cursor-pointer shadow-lg shadow-red-500/20" onClick={() => router.push('/')}>
                            <span className="text-[8px] tracking-tighter">NAVY</span>
                            <span className="text-sm">PIBOK</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-extrabold text-xl tracking-tighter">해군 함상 생활 가이드</h1>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Digital Archive Tips</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-xs font-bold gap-2 text-zinc-500 hover:text-black transition-colors"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeft className="h-4 w-4" /> 돌아가기
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Visual Background Element */}
                <div className="absolute inset-0 digital-pattern pointer-events-none opacity-[0.03]" />

                <section className="max-w-[1000px] mx-auto w-full px-6 py-16 relative z-10">
                    <div className="space-y-2 mb-16 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-[#EE1C23] px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest mb-4">
                            <Waves className="h-3 w-3" />
                            <span>SMART LOGISTICS TIPS</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                            함상 생활의 질을 높이는 <br />
                            <span className="text-[#EE1C23]">선진 피복 관리</span> 가이드
                        </h2>
                        <p className="text-zinc-500 font-medium text-lg font-dream max-w-2xl mt-6 leading-relaxed">
                            좁은 함실에서도 정갈함을 유지하고, 실전 임무에 최적화된 컨디션을 유지하기 위한 <br />
                            해군 장병들을 위한 스마트 보급 시스템 및 피복 활용 팁을 소개합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {tips.map((tip, idx) => (
                            <div key={idx} className="group border-l-2 border-zinc-100 pl-8 space-y-4 hover:border-[#EE1C23] transition-all duration-500">
                                <div className="flex items-center gap-3">
                                    {tip.icon}
                                    <h3 className="text-xl font-black tracking-tight">{tip.title}</h3>
                                </div>
                                <p className="text-zinc-500 text-sm font-dream leading-relaxed">
                                    {tip.description}
                                </p>
                                <ul className="space-y-3 pt-2">
                                    {tip.details.map((detail, dIdx) => (
                                        <li key={dIdx} className="flex items-start gap-3 text-[13px] font-bold text-zinc-700 font-dream">
                                            <div className="h-1 w-1 rounded-full bg-[#EE1C23] mt-2 shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA Area */}
                    <div className="mt-24 bg-zinc-950 p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="absolute inset-0 digital-pattern opacity-10" />
                        <div className="relative z-10 space-y-2">
                            <h4 className="text-2xl font-black text-white tracking-tighter">지금 바로 스마트 보급을 신청하세요</h4>
                            <p className="text-white/40 font-dream text-sm">해군 통합 전산망을 통해 잔여 포인트를 확인하고 신청할 수 있습니다.</p>
                        </div>
                        <Button
                            className="relative z-10 h-16 px-10 bg-[#EE1C23] text-white font-black rounded-none transition-all hover:scale-105 text-sm uppercase italic shadow-xl shadow-red-500/30"
                            onClick={() => router.push('/')}
                        >
                            스마트 보급 시스템 접속 <Search className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-zinc-100 px-6 py-10 bg-white">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 NAVY ARCHIVE : OCEAN EDITION RESOURCES</p>
                    <div className="flex gap-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span className="hover:text-black cursor-pointer transition-colors">보급 규정 및 기준</span>
                        <span className="hover:text-black cursor-pointer transition-colors">바다로 서비스 안내</span>
                        <span className="hover:text-black cursor-pointer transition-colors">개인정보처리방침</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
