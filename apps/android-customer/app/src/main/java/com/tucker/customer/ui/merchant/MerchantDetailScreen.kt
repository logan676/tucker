package com.tucker.customer.ui.merchant

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.tucker.customer.data.models.MenuCategory
import com.tucker.customer.data.models.Product
import com.tucker.customer.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MerchantDetailScreen(
    merchantId: String,
    onBackClick: () -> Unit,
    viewModel: MerchantDetailViewModel = hiltViewModel()
) {
    val merchant by viewModel.merchant.collectAsState()
    val menu by viewModel.menu.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()
    val totalItems by viewModel.totalItems.collectAsState()
    val totalPrice by viewModel.totalPrice.collectAsState()

    LaunchedEffect(merchantId) {
        viewModel.loadMerchant(merchantId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(merchant?.name ?: "") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Orange,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        bottomBar = {
            if (totalItems > 0) {
                CartBar(
                    totalItems = totalItems,
                    totalPrice = totalPrice,
                    onCheckoutClick = { /* Navigate to checkout */ }
                )
            }
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Orange)
            }
        } else {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // Category sidebar
                LazyColumn(
                    modifier = Modifier
                        .width(90.dp)
                        .fillMaxHeight()
                        .background(LightGray)
                ) {
                    items(menu?.categories ?: emptyList()) { category ->
                        CategoryTab(
                            category = category,
                            isSelected = selectedCategory == category.id,
                            onClick = { viewModel.selectCategory(category.id) }
                        )
                    }
                }

                // Products
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    val currentCategory = menu?.categories?.find { it.id == selectedCategory }
                    items(currentCategory?.products ?: emptyList()) { product ->
                        ProductRow(
                            product = product,
                            quantity = viewModel.getQuantity(product.id),
                            onAddClick = { viewModel.addToCart(product) },
                            onRemoveClick = { viewModel.removeFromCart(product) }
                        )
                        Divider(modifier = Modifier.padding(start = 96.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryTab(
    category: MenuCategory,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .background(if (isSelected) Color.White else Color.Transparent)
            .padding(vertical = 12.dp, horizontal = 8.dp)
    ) {
        Text(
            text = category.name,
            style = MaterialTheme.typography.bodySmall,
            color = if (isSelected) Orange else Color.Black
        )
    }
}

@Composable
fun ProductRow(
    product: Product,
    quantity: Int,
    onAddClick: () -> Unit,
    onRemoveClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box {
            AsyncImage(
                model = product.image,
                contentDescription = product.name,
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            if (product.isRecommend) {
                Surface(
                    color = Red,
                    shape = RoundedCornerShape(topStart = 8.dp, bottomEnd = 4.dp),
                    modifier = Modifier.align(Alignment.TopStart)
                ) {
                    Text(
                        text = "HOT",
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = product.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            if (!product.description.isNullOrEmpty()) {
                Text(
                    text = product.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "¥${product.price.toInt()}",
                        color = Orange,
                        fontWeight = FontWeight.Medium
                    )
                    product.originalPrice?.let { originalPrice ->
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "¥${originalPrice.toInt()}",
                            color = Gray,
                            style = MaterialTheme.typography.bodySmall,
                            textDecoration = TextDecoration.LineThrough
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (quantity > 0) {
                        IconButton(
                            onClick = onRemoveClick,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Remove,
                                contentDescription = "Remove",
                                tint = Orange,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Text(text = quantity.toString())
                    }
                    IconButton(
                        onClick = onAddClick,
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(Orange)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CartBar(
    totalItems: Int,
    totalPrice: Double,
    onCheckoutClick: () -> Unit
) {
    Surface(
        color = DarkGray,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                BadgedBox(
                    badge = {
                        Badge(containerColor = Red) {
                            Text(totalItems.toString())
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Cart",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "¥${String.format("%.2f", totalPrice)}",
                    color = Color.White,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            Button(
                onClick = onCheckoutClick,
                colors = ButtonDefaults.buttonColors(containerColor = Orange),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text("Checkout")
            }
        }
    }
}
