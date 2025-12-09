package com.tucker.merchant.data.repository

import com.tucker.merchant.data.api.ApiService
import com.tucker.merchant.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MerchantRepository @Inject constructor(
    private val apiService: ApiService
) {
    // Dashboard
    suspend fun getDashboardStats(): DashboardStats {
        return apiService.getDashboardStats()
    }

    // Orders
    suspend fun getOrders(
        page: Int = 1,
        pageSize: Int = 20,
        status: String? = null
    ): PaginatedResponse<Order> {
        return apiService.getMerchantOrders(page, pageSize, status)
    }

    suspend fun getOrder(id: String): Order {
        return apiService.getMerchantOrder(id)
    }

    suspend fun updateOrderStatus(orderId: String, status: String, reason: String? = null): Order {
        return apiService.updateOrderStatus(orderId, UpdateOrderStatusRequest(status, reason))
    }

    // Products
    suspend fun getProducts(): List<Product> {
        return apiService.getMerchantProducts()
    }

    suspend fun getProduct(id: String): Product {
        return apiService.getMerchantProduct(id)
    }

    suspend fun createProduct(
        name: String,
        description: String?,
        price: Double,
        originalPrice: Double?,
        image: String?,
        categoryId: String?,
        isAvailable: Boolean
    ): Product {
        return apiService.createProduct(
            CreateProductRequest(
                name = name,
                description = description,
                price = price,
                originalPrice = originalPrice,
                image = image,
                categoryId = categoryId,
                isAvailable = isAvailable
            )
        )
    }

    suspend fun updateProduct(
        id: String,
        name: String?,
        description: String?,
        price: Double?,
        originalPrice: Double?,
        image: String?,
        categoryId: String?,
        isAvailable: Boolean?
    ): Product {
        return apiService.updateProduct(
            id,
            UpdateProductRequest(
                name = name,
                description = description,
                price = price,
                originalPrice = originalPrice,
                image = image,
                categoryId = categoryId,
                isAvailable = isAvailable
            )
        )
    }

    suspend fun deleteProduct(id: String) {
        apiService.deleteProduct(id)
    }

    suspend fun toggleProductAvailability(id: String, isAvailable: Boolean): Product {
        return apiService.toggleProductAvailability(id, ToggleAvailabilityRequest(isAvailable))
    }

    // Store
    suspend fun getStoreSettings(): Merchant {
        return apiService.getStoreSettings()
    }

    suspend fun updateStoreSettings(
        name: String?,
        description: String?,
        logo: String?,
        banner: String?,
        phone: String?,
        address: String?,
        deliveryFee: Double?,
        deliveryTime: String?,
        minOrderAmount: Double?
    ): Merchant {
        return apiService.updateStoreSettings(
            UpdateStoreRequest(
                name = name,
                description = description,
                logo = logo,
                banner = banner,
                phone = phone,
                address = address,
                deliveryFee = deliveryFee,
                deliveryTime = deliveryTime,
                minOrderAmount = minOrderAmount
            )
        )
    }

    suspend fun toggleStoreOpen(isOpen: Boolean): Merchant {
        return apiService.toggleStoreOpen(ToggleStoreRequest(isOpen))
    }
}
