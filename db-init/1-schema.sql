-- 1. 기존 테이블 및 시퀀스 삭제 (초기화용)
DROP TABLE IF EXISTS 
    tailor_settlements, menus, tailoring_tickets, order_items, orders, 
    point_ledger, point_summary, inventory_log, inventory, delivery_zones, 
    product_specs, products, categories, users, tailors, stores 
CASCADE;

DROP SEQUENCE IF EXISTS order_number_seq, ticket_number_seq;

-- 2. 확장 기능 활성화 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1-1. 시퀀스 생성 (자동 번호용)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- 2. 공통 트리거 함수 (updated_at 자동 갱신)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. 테이블 생성

-- 피복판매소 (stores)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    contact VARCHAR(50),
    manager_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 체척업체 (tailors)
CREATE TABLE tailors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    business_number VARCHAR(20) UNIQUE,
    representative VARCHAR(50),
    address TEXT,
    contact VARCHAR(50),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    account_holder VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 (users)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Firebase Auth / Identity Platform UID 연동
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- 초기 시스템용 (향후 hashing 적용 권장)
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'store', 'tailor', 'user')),
    rank VARCHAR(20), -- 계급 (user인 경우 필수)
    military_number VARCHAR(30),
    unit VARCHAR(100),
    enlist_date DATE,
    promotion_date DATE,
    retirement_date DATE,
    store_id UUID REFERENCES stores(id),
    tailor_id UUID REFERENCES tailors(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 품목 분류 (categories)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    level INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 품목 (products)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('finished', 'custom')),
    base_price INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 완제품 규격 (product_specs)
CREATE TABLE product_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    spec_name VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 직접 배송지 (delivery_zones)
CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    address TEXT,
    note TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 재고 (inventory)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    spec_id UUID REFERENCES product_specs(id),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, spec_id)
);

-- 재고 변동 이력 (inventory_log)
CREATE TABLE inventory_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    change_type VARCHAR(20) NOT NULL, -- incoming, sale, return, adjust_up, adjust_down
    change_quantity INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 포인트 요약 (point_summary)
CREATE TABLE point_summary (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_granted INTEGER DEFAULT 0,
    used_points INTEGER DEFAULT 0,
    reserved_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 포인트 원장 (point_ledger)
CREATE TABLE point_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    point_type VARCHAR(20) NOT NULL, -- grant, deduct, add, return, reserve, release
    amount INTEGER NOT NULL,
    balance_after INTEGER,
    description TEXT,
    reference_type VARCHAR(30), -- order, ticket, annual
    reference_id UUID,
    fiscal_year SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 주문 (orders)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    store_id UUID REFERENCES stores(id),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('online', 'offline')),
    product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('finished', 'custom')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount INTEGER NOT NULL,
    delivery_method VARCHAR(20), -- parcel, direct
    delivery_zone_id UUID REFERENCES delivery_zones(id),
    delivery_address TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 주문 상세 (order_items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    spec_id UUID REFERENCES product_specs(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'normal', -- normal, returned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 체척권 (tailoring_tickets)
CREATE TABLE tailoring_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    order_item_id UUID REFERENCES order_items(id),
    user_id UUID REFERENCES users(id),
    tailor_id UUID REFERENCES tailors(id),
    status VARCHAR(20) NOT NULL DEFAULT 'issued', -- issued, registered, cancel_requested, cancelled
    registered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 체척업체 정산 (tailor_settlements)
CREATE TABLE tailor_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tailor_id UUID REFERENCES tailors(id),
    settlement_period_start DATE NOT NULL,
    settlement_period_end DATE NOT NULL,
    total_amount INTEGER NOT NULL,
    ticket_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 메뉴 관리 (menus)
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    parent_id UUID REFERENCES menus(id),
    sort_order INTEGER DEFAULT 0,
    roles VARCHAR(100), -- 콤마로 구분된 역할 목록 (admin,store,...)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 트리거 설정
CREATE TRIGGER update_stores_modtime BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tailors_modtime BEFORE UPDATE ON tailors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_specs_modtime BEFORE UPDATE ON product_specs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tailoring_tickets_modtime BEFORE UPDATE ON tailoring_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 공지사항 (notices)
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_priority BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 의견수렴/문의 (feedbacks)
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    title VARCHAR(255),
    content TEXT NOT NULL,
    reply_content TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, replied
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_notices_modtime BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedbacks_modtime BEFORE UPDATE ON feedbacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
