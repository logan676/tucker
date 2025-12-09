package com.tucker.merchant.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.tucker.merchant.data.repository.AuthRepository
import com.tucker.merchant.ui.auth.LoginScreen
import com.tucker.merchant.ui.dashboard.DashboardScreen
import com.tucker.merchant.ui.orders.OrderDetailScreen
import com.tucker.merchant.ui.orders.OrdersScreen
import com.tucker.merchant.ui.products.ProductFormScreen
import com.tucker.merchant.ui.products.ProductsScreen
import com.tucker.merchant.ui.settings.SettingsScreen

sealed class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Dashboard)
    object Orders : Screen("orders", "Orders", Icons.Default.Receipt)
    object Products : Screen("products", "Products", Icons.Default.Inventory)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

val bottomNavItems = listOf(
    Screen.Dashboard,
    Screen.Orders,
    Screen.Products,
    Screen.Settings
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TuckerMerchantApp(
    authRepository: AuthRepository
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val isAuthenticated by authRepository.isAuthenticated.collectAsState(initial = false)

    val showBottomNav = bottomNavItems.any { it.route == currentDestination?.route }

    // Navigate based on auth state
    LaunchedEffect(isAuthenticated) {
        if (!isAuthenticated) {
            navController.navigate("login") {
                popUpTo(0) { inclusive = true }
            }
        } else if (currentDestination?.route == "login") {
            navController.navigate(Screen.Dashboard.route) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    Scaffold(
        bottomBar = {
            if (showBottomNav && isAuthenticated) {
                NavigationBar {
                    bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = if (isAuthenticated) Screen.Dashboard.route else "login",
            modifier = Modifier.padding(innerPadding)
        ) {
            // Login
            composable("login") {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            // Dashboard
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    onOrderClick = { orderId ->
                        navController.navigate("order/$orderId")
                    }
                )
            }

            // Orders
            composable(Screen.Orders.route) {
                OrdersScreen(
                    onOrderClick = { orderId ->
                        navController.navigate("order/$orderId")
                    }
                )
            }

            // Order Detail
            composable(
                route = "order/{orderId}",
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) {
                OrderDetailScreen(
                    onBackClick = { navController.popBackStack() }
                )
            }

            // Products
            composable(Screen.Products.route) {
                ProductsScreen(
                    onAddProduct = {
                        navController.navigate("product/new")
                    },
                    onEditProduct = { productId ->
                        navController.navigate("product/$productId")
                    }
                )
            }

            // Product Form (Add)
            composable("product/new") {
                ProductFormScreen(
                    onBackClick = { navController.popBackStack() }
                )
            }

            // Product Form (Edit)
            composable(
                route = "product/{productId}",
                arguments = listOf(navArgument("productId") { type = NavType.StringType })
            ) {
                ProductFormScreen(
                    onBackClick = { navController.popBackStack() }
                )
            }

            // Settings
            composable(Screen.Settings.route) {
                SettingsScreen(
                    onLogout = {
                        navController.navigate("login") {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
