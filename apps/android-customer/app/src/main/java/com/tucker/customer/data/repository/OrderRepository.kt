package com.tucker.customer.data.repository

import com.tucker.customer.data.api.ApiService
import com.tucker.customer.data.models.Order
import com.tucker.customer.data.models.PaginatedResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getOrders(page: Int = 1, pageSize: Int = 20): PaginatedResponse<Order> {
        return apiService.getOrders(page, pageSize)
    }

    suspend fun getOrder(id: String): Order {
        return apiService.getOrder(id)
    }
}
