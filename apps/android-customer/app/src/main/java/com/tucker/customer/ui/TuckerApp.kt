package com.tucker.customer.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.tucker.customer.ui.auth.LoginScreen
import com.tucker.customer.ui.home.HomeScreen
import com.tucker.customer.ui.merchant.MerchantDetailScreen
import com.tucker.customer.ui.orders.OrdersScreen
import com.tucker.customer.ui.profile.ProfileScreen
import com.tucker.customer.ui.search.SearchScreen

sealed class Screen(val route: String, val title: String, val icon: @Composable () -> Unit) {
    object Home : Screen("home", "Home", { Icon(Icons.Default.Home, contentDescription = "Home") })
    object Search : Screen("search", "Search", { Icon(Icons.Default.Search, contentDescription = "Search") })
    object Orders : Screen("orders", "Orders", { Icon(Icons.Default.Receipt, contentDescription = "Orders") })
    object Profile : Screen("profile", "Profile", { Icon(Icons.Default.Person, contentDescription = "Profile") })
}

val bottomNavItems = listOf(Screen.Home, Screen.Search, Screen.Orders, Screen.Profile)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TuckerApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val showBottomNav = bottomNavItems.any { it.route == currentDestination?.route }

    Scaffold(
        bottomBar = {
            if (showBottomNav) {
                NavigationBar {
                    bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            icon = screen.icon,
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
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onMerchantClick = { merchantId ->
                        navController.navigate("merchant/$merchantId")
                    }
                )
            }
            composable(Screen.Search.route) {
                SearchScreen(
                    onMerchantClick = { merchantId ->
                        navController.navigate("merchant/$merchantId")
                    }
                )
            }
            composable(Screen.Orders.route) {
                OrdersScreen(
                    onLoginClick = { navController.navigate("login") }
                )
            }
            composable(Screen.Profile.route) {
                ProfileScreen(
                    onLoginClick = { navController.navigate("login") }
                )
            }
            composable(
                route = "merchant/{merchantId}",
                arguments = listOf(navArgument("merchantId") { type = NavType.StringType })
            ) { backStackEntry ->
                val merchantId = backStackEntry.arguments?.getString("merchantId") ?: ""
                MerchantDetailScreen(
                    merchantId = merchantId,
                    onBackClick = { navController.popBackStack() }
                )
            }
            composable("login") {
                LoginScreen(
                    onBackClick = { navController.popBackStack() },
                    onLoginSuccess = { navController.popBackStack() }
                )
            }
        }
    }
}
