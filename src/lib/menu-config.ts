export type NavItem = {
    title: string;
    href: string;
    icon?: string;
    roles: string[];
};

export const navItems: NavItem[] = [
    // Admin Items
    { title: "대시보드", href: "/admin/dashboard", roles: ["admin"] },
    { title: "사용자 관리", href: "/admin/users", roles: ["admin"] },
    { title: "포인트 관리", href: "/admin/points", roles: ["admin"] },
    { title: "품목 관리", href: "/admin/products", roles: ["admin"] },
    { title: "카테고리 관리", href: "/admin/categories", roles: ["admin"] },
    { title: "판매소 관리", href: "/admin/stores", roles: ["admin"] },
    { title: "체척업체 관리", href: "/admin/tailors", roles: ["admin"] },
    { title: "취소요청 승인", href: "/admin/tickets/cancellations", roles: ["admin"] },
    { title: "업체 정산관리", href: "/admin/settlements", roles: ["admin"] },

    // Store Items
    { title: "판매소 대시보드", href: "/store/dashboard", roles: ["store"] },
    { title: "판매 현황 대시보드", href: "/store/sales", roles: ["store"] },
    { title: "오프라인 판매", href: "/store/sales/new", roles: ["store"] },
    { title: "배송 관리", href: "/store/orders", roles: ["store"] },
    { title: "재고 현황", href: "/store/inventory", roles: ["store"] },

    // User Items
    { title: "쇼핑몰", href: "/my/shop", roles: ["user"] },
    { title: "장바구니", href: "/my/cart", roles: ["user"] },
    { title: "주문 내역", href: "/my/orders", roles: ["user"] },
    { title: "포인트 정보", href: "/my/points", roles: ["user"] },

    // Tailor Items
    { title: "업체 대시보드", href: "/tailor/dashboard", roles: ["tailor"] },
    { title: "체척권 등록", href: "/tailor/tickets/register", roles: ["tailor"] },
    { title: "등록 현황", href: "/tailor/tickets", roles: ["tailor"] },
];
