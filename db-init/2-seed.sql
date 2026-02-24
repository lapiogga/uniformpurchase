-- 피복구매시스템 종합 테스트 시드 데이터 (seed.sql)
-- 데이터간의 논리적 정합성 및 연결고리 검증용

-- 1. 기초 데이터 초기화 (필요 시)
-- TRUNCATE users, stores, tailoring_shops, categories, products, product_specs, inventory, point_summary, point_ledger, orders, order_items, tailoring_tickets RESTART IDENTITY CASCADE;

-- 2. 분류 (Categories) - 계층 구조 및 정합성 테스트용
INSERT INTO categories (id, name, level, sort_order) VALUES
('CAT-001', '전투복', 1, 1),
('CAT-002', '정복', 1, 2),
('CAT-003', '체력단련복', 1, 3),
('CAT-011', '하절기 전투복', 2, 1),
('CAT-012', '동절기 전투복', 2, 2);

-- 3. 판매소 및 체척업체 (Stores & Tailors)
INSERT INTO stores (id, name, location, contact, is_active) VALUES
('STR-001', '육군 본부 판매소', '계룡', '042-123-4567', true),
('STR-002', '제1보충대 판매소', '춘천', '033-987-6543', true);

INSERT INTO tailoring_shops (id, name, location, contact, is_active) VALUES
('TLR-001', '(주)군복장인', '서울', '02-111-2222', true),
('TLR-002', '대한테일러', '대전', '042-444-5555', true);

-- 4. 사용자 (Users) - 역할별 데이터 연결 테스트용
INSERT INTO users (id, email, name, role, rank, military_number, unit, enlist_date, is_active, store_id, tailor_id) VALUES
-- Admin
('USR-ADM-001', 'admin@mil.kr', '관리자(군수팀)', 'admin', 'major', '05-10042', '육군본부 군수사', '2005-03-01', true, null, null),
-- Store Users
('USR-STR-001', 'store1@mil.kr', '이판매', 'store', 'master_sgt', '10-20031', '육군본부 판매소', '2010-06-01', true, 'STR-001', null),
-- Tailor Users
('USR-TLR-001', 'tailor1@mil.kr', '김테일러', 'tailor', null, null, '(주)군복장인', '2020-01-01', true, null, 'TLR-001'),
-- Regular Users (BR-004 ~ BR-007 테스트용)
('USR-IND-001', 'hong@mil.kr', '홍길동', 'user', 'captain', '15-12345', '제1보병사단', '2015-03-01', true, null, null), -- 11년차 (2026 기준)
('USR-IND-002', 'kim@mil.kr', '김철수', 'user', 'sgt', '18-54321', '제2작전사령부', '2018-05-15', true, null, null),  -- 8년차
('USR-IND-003', 'lee@mil.kr', '이순신', 'user', 'colonel', '00-99999', '합동참모본부', '2000-01-01', true, null, null); -- 26년차

-- 5. 품목 및 규격 (Products & Specs)
-- 완제품 (Finished)
INSERT INTO products (id, name, category_id, product_type, base_price, image_url, is_active) VALUES
('PRD-001', '하절기 전투복 상의', 'CAT-011', 'finished', 45000, 'https://images.unsplash.com/photo-1579309401359-da07551dd7a9?auto=format&fit=crop&q=80&w=800', true),
('PRD-002', '동절기 전투복 하의', 'CAT-012', 'finished', 55000, 'https://images.unsplash.com/photo-1584281722573-77291a13e5d0?auto=format&fit=crop&q=80&w=800', true);

INSERT INTO product_specs (id, product_id, spec_name, sort_order) VALUES
('SPC-001', 'PRD-001', '95(L)', 1),
('SPC-002', 'PRD-001', '100(XL)', 2),
('SPC-003', 'PRD-002', '32(inch)', 1),
('SPC-004', 'PRD-002', '34(inch)', 2);

-- 맞춤피복 (Custom)
INSERT INTO products (id, name, category_id, product_type, base_price, image_url, is_active) VALUES
('PRD-101', '장교용 정복 상의(맞춤)', 'CAT-002', 'custom', 150000, 'https://images.unsplash.com/photo-1590559063897-09bcba6368d1?auto=format&fit=crop&q=80&w=800', true);

INSERT INTO product_specs (id, product_id, spec_name, sort_order) VALUES
('SPC-101', 'PRD-101', '맞춤형(체척필요)', 1);

-- 6. 재고 (Inventory) - Store 연동 테스트
INSERT INTO inventory (id, store_id, product_id, spec_id, quantity) VALUES
('INV-001', 'STR-001', 'PRD-001', 'SPC-001', 50),
('INV-002', 'STR-001', 'PRD-001', 'SPC-002', 30),
('INV-003', 'STR-002', 'PRD-002', 'SPC-003', 20);

-- 7. 포인트 (Points) - BR-012: 기초 데이터 구축
INSERT INTO point_summary (user_id, total_granted, used_points, reserved_points) VALUES
('USR-IND-001', 1050000, 0, 0), -- 예시 포인트
('USR-IND-002', 440000, 0, 0),
('USR-IND-003', 950000, 0, 0);

INSERT INTO point_ledger (user_id, point_type, amount, fiscal_year, description, reference_type) VALUES
('USR-IND-001', 'grant', 1050000, 2026, '2026년 정기 포인트 지급', 'annual'),
('USR-IND-002', 'grant', 440000, 2026, '2026년 정기 포인트 지급', 'annual'),
('USR-IND-003', 'grant', 950000, 2026, '2026년 정기 포인트 지급', 'annual');

-- 8. 주문 (Orders) - 데이터 연결 일치성 테스트 (REQ-U-151)
-- 홍길동의 완제품 주문 (온라인)
INSERT INTO orders (id, order_number, user_id, store_id, order_type, product_type, status, total_amount) VALUES
('ORD-001', 'ORD-20260224-00001', 'USR-IND-001', 'STR-001', 'online', 'finished', 'pending', 45000);

INSERT INTO order_items (order_id, product_id, spec_id, quantity, unit_price, subtotal) VALUES
('ORD-001', 'PRD-001', 'SPC-001', 1, 45000, 45000);

-- 포인트 예약 처리 (Pending 주문 시 정합성 테스트)
UPDATE point_summary SET reserved_points = 45000 WHERE user_id = 'USR-IND-001';

-- 김철수의 맞춤 피복 주문 (체척권 발행 테스트)
INSERT INTO orders (id, order_number, user_id, store_id, order_type, product_type, status, total_amount) VALUES
('ORD-002', 'ORD-20260224-00002', 'USR-IND-002', null, 'online', 'custom', 'pending', 150000);

INSERT INTO order_items (id, order_id, product_id, spec_id, quantity, unit_price, subtotal) VALUES
('OIT-002', 'ORD-002', 'PRD-101', 'SPC-101', 1, 150000, 150000);

-- 체척권 발행 연동
INSERT INTO tailoring_tickets (id, ticket_number, user_id, order_item_id, status) VALUES
('TKT-001', 'TKT-20260224-00001', 'USR-IND-002', 'OIT-002', 'issued');
