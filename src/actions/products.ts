'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 활성 카테고리 목록 조회
 * (레벨 순서 및 정렬 순서 반영)
 */
export async function getCategories() {
    try {
        const result = await query(`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY level ASC, sort_order ASC
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return { success: false, error: '분류 정보를 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 품목 목록 조회 (필터 및 검색 지원)
 * @param filters 카테고리 ID, 품목 유형(완제/맞춤), 검색어 필터
 */
export async function getProducts(filters?: { categoryId?: string; productType?: string; search?: string }) {
    try {
        let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
        const params: any[] = [];

        // 카테고리 기반 필터링
        if (filters?.categoryId) {
            params.push(filters.categoryId);
            sql += ` AND p.category_id = $${params.length}`;
        }

        // 품목 유형 기반 필터링 (finished | custom)
        if (filters?.productType) {
            params.push(filters.productType);
            sql += ` AND p.product_type = $${params.length}`;
        }

        // 품목명 검색
        if (filters?.search) {
            params.push(`%${filters.search}%`);
            sql += ` AND p.name ILIKE $${params.length}`;
        }

        sql += ' ORDER BY p.created_at DESC';

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return { success: false, error: '품목 정보를 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 특정 품목 상세 정보 조회
 */
export async function getProductById(productId: string) {
    try {
        const result = await query('SELECT * FROM products WHERE id = $1', [productId]);
        if (result.rows.length === 0) return { success: false, error: '품목을 찾을 수 없습니다.' };
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return { success: false, error: '품목 정보를 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 특정 품목의 사용 가능한 규격(사이즈 등) 목록 조회
 */
export async function getProductSpecs(productId: string) {
    try {
        const result = await query(`
      SELECT * FROM product_specs 
      WHERE product_id = $1 AND is_active = true 
      ORDER BY sort_order ASC
    `, [productId]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch specs:', error);
        return { success: false, error: '규격 정보를 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 품목 정보 등록 또는 수정 (Upsert)
 * @param productData 카테고리, 이름, 유형, 가격, 이미지, 설명 등
 */
export async function upsertProduct(productData: any) {
    try {
        const isNew = !productData.id;
        let sql;
        let params;

        if (isNew) {
            // 신규 등록
            sql = `
        INSERT INTO products (category_id, name, product_type, base_price, image_url, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
            params = [
                productData.category_id,
                productData.name,
                productData.product_type,
                productData.base_price,
                productData.image_url,
                productData.description
            ];
        } else {
            // 기존 정보 수정
            sql = `
        UPDATE products 
        SET category_id = $1, name = $2, product_type = $3, base_price = $4, image_url = $5, description = $6
        WHERE id = $7
        RETURNING *
      `;
            params = [
                productData.category_id,
                productData.name,
                productData.product_type,
                productData.base_price,
                productData.image_url,
                productData.description,
                productData.id
            ];
        }

        const result = await query(sql, params);
        // 캐시 무효화를 통해 리스트 페이지 최신화
        revalidatePath('/admin/products');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to upsert product:', error);
        return { success: false, error: '품목 저장 중 오류가 발생했습니다.' };
    }
}
/**
 * 규격 추가
 */
export async function addProductSpec(productId: string, specName: string, sortOrder: number = 0) {
    try {
        const result = await query(
            'INSERT INTO product_specs (product_id, spec_name, sort_order) VALUES ($1, $2, $3) RETURNING *',
            [productId, specName, sortOrder]
        );
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to add spec:', error);
        return { success: false, error: '규격 추가 중 오류가 발생했습니다.' };
    }
}

/**
 * 규격 수정
 */
export async function updateProductSpec(specId: string, specName: string, sortOrder: number) {
    try {
        const result = await query(
            'UPDATE product_specs SET spec_name = $1, sort_order = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [specName, sortOrder, specId]
        );
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to update spec:', error);
        return { success: false, error: '규격 수정 중 오류가 발생했습니다.' };
    }
}

/**
 * 규격 삭제 (비활성화)
 */
export async function deleteProductSpec(specId: string) {
    try {
        await query('UPDATE product_specs SET is_active = false WHERE id = $1', [specId]);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete spec:', error);
        return { success: false, error: '규격 삭제 중 오류가 발생했습니다.' };
    }
}
