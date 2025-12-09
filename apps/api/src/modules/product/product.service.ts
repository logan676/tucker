import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';
import {
  ProductListItemDto,
  CategoryWithProductsDto,
  ProductMenuResponseDto,
} from './dto/product-menu.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async getProductsByMerchant(merchantId: string): Promise<ProductMenuResponseDto> {
    // Get all categories for the merchant
    const categories = await this.categoryRepository.find({
      where: { merchantId },
      order: { sortOrder: 'ASC' },
    });

    // Get all products for the merchant
    const products = await this.productRepository.find({
      where: { merchantId, isAvailable: true },
      order: { sortOrder: 'ASC' },
    });

    // Group products by category
    const categoryMap = new Map<string | null, ProductListItemDto[]>();
    products.forEach((p) => {
      const categoryId = p.categoryId;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, []);
      }
      categoryMap.get(categoryId)!.push({
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.image,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        monthlySales: p.monthlySales,
        likes: p.likes,
        isAvailable: p.isAvailable,
      });
    });

    // Build result with categories
    const result: CategoryWithProductsDto[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      products: categoryMap.get(cat.id) || [],
    }));

    // Add uncategorized products if any
    const uncategorized = categoryMap.get(null);
    if (uncategorized && uncategorized.length > 0) {
      result.unshift({
        id: 'uncategorized',
        name: 'Other',
        products: uncategorized,
      });
    }

    return { categories: result };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new BusinessException(
        ErrorCodes.PRODUCT_UNAVAILABLE,
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }

  async checkProductAvailability(
    productIds: string[],
    merchantId: string,
  ): Promise<Map<string, Product>> {
    const products = await this.productRepository.find({
      where: productIds.map((id) => ({ id, merchantId, isAvailable: true })),
    });

    const productMap = new Map<string, Product>();
    products.forEach((p) => productMap.set(p.id, p));

    return productMap;
  }
}
