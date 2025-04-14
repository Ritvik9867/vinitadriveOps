# Keep important classes
-keep class com.vinitadriveops.app.** { *; }
-keep class androidx.core.** { *; }

# Capacitor-specific rules
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }

# WebView rules
-keep class * extends android.webkit.WebChromeClient { *; }
-keep class * extends android.webkit.WebViewClient { *; }

# File provider rules
-keep class androidx.core.content.FileProvider { *; }
-keep class androidx.core.content.FileProvider$PathStrategy { *; }

# Remove debug logs in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimization rules
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Keep source file names for better crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
