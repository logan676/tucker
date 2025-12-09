# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.kts.

# Keep Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}

-keep,includedescriptorclasses class com.tucker.merchant.**$$serializer { *; }
-keepclassmembers class com.tucker.merchant.** {
    *** Companion;
}
-keepclasseswithmembers class com.tucker.merchant.** {
    kotlinx.serialization.KSerializer serializer(...);
}
