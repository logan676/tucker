package com.tucker.customer.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Category(
    val id: String,
    val name: String,
    val icon: String? = null,
    val sortOrder: Int = 0
)

@Serializable
data class Merchant(
    val id: String,
    val name: String,
    val logo: String? = null,
    val banner: String? = null,
    val description: String? = null,
    val rating: Double = 0.0,
    val ratingCount: Int = 0,
    val monthlySales: Int = 0,
    val deliveryFee: Double = 0.0,
    val minOrderAmount: Double = 0.0,
    val deliveryTime: String? = null,
    val address: String? = null,
    val phone: String? = null,
    val isOpen: Boolean = true
)

@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String? = null,
    val price: Double,
    val originalPrice: Double? = null,
    val image: String? = null,
    val categoryId: String,
    val merchantId: String,
    val isAvailable: Boolean = true,
    val isRecommend: Boolean = false,
    val sortOrder: Int = 0
)

@Serializable
data class MenuCategory(
    val id: String,
    val name: String,
    val products: List<Product>
)

@Serializable
data class MenuResponse(
    val categories: List<MenuCategory>
)

@Serializable
data class User(
    val id: String,
    val phone: String,
    val nickname: String? = null,
    val avatar: String? = null
)

@Serializable
data class AuthResponse(
    val accessToken: String,
    val user: User
)

@Serializable
data class Order(
    val id: String,
    val orderNo: String,
    val status: String,
    val totalAmount: Double,
    val deliveryFee: Double = 0.0,
    val discountAmount: Double = 0.0,
    val payAmount: Double,
    val merchantId: String,
    val merchantName: String? = null,
    val items: List<OrderItem>? = null,
    val deliveryAddress: DeliveryAddress? = null,
    val createdAt: String,
    val paidAt: String? = null
)

@Serializable
data class DeliveryAddress(
    val name: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val detail: String
)

@Serializable
data class OrderItem(
    val id: String,
    val productId: String,
    val productName: String,
    val price: Double,
    val quantity: Int,
    val image: String? = null
)

@Serializable
data class Address(
    val id: String,
    val label: String? = null,
    val name: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val detail: String,
    val isDefault: Boolean = false
)

@Serializable
data class CreateOrderResponse(
    val orderId: String,
    val orderNo: String,
    val totalAmount: Double,
    val deliveryFee: Double,
    val discountAmount: Double,
    val payAmount: Double,
    val payExpireAt: String
)

@Serializable
data class PaymentResponse(
    val paymentId: String,
    val orderId: String,
    val amount: Double,
    val method: String,
    val paymentUrl: String,
    val expireAt: String
)

@Serializable
data class MockPaymentResult(
    val message: String,
    val status: String
)

@Serializable
data class PaginatedResponse<T>(
    val items: List<T>,
    val total: Int,
    val page: Int,
    val pageSize: Int
)
