package com.tucker.customer.data.repository

import com.tucker.customer.data.api.ApiService
import com.tucker.customer.data.models.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MerchantRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getCategories(): List<Category> {
        return apiService.getCategories()
    }

    suspend fun getMerchants(page: Int = 1, pageSize: Int = 20): PaginatedResponse<Merchant> {
        return apiService.getMerchants(page, pageSize)
    }

    suspend fun getMerchant(id: String): Merchant {
        return apiService.getMerchant(id)
    }

    suspend fun getMerchantMenu(merchantId: String): MenuResponse {
        return apiService.getMerchantMenu(merchantId)
    }
}
