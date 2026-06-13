import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";

// Components
import HomeHeader from "./HomeHeader";
import SearchBar from "./SearchBar";
import CategoryScroller from "./CategoryScroller";
import BannerCarousel from "./BannerCarousel";
import CategorySection from "./CategorySection";
import TrendingSection from "./TrendingSection";
import AddressModal from "./AddressModal";
import HomeSkeleton from "../../components/skeletons/HomeSkeleton";
import api from "../../services/api";
import { useLocation } from "../../context/LocationContext";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { currentLocation } = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  // --- API DATA ---
  const { data: rawCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => (await api.get("/api/categories")).data,
  });

  const categories = useMemo(() => rawCategories.map((c: any) => ({
    id: c.id || c._id,
    name: c.name,
    icon: c.icon,
    image: c.image,
    shops: c.shops || [],
  })), [rawCategories]);

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery<any>({
    queryKey: ["/api/products", currentLocation?.pincode],
    queryFn: async () => {
      const params = {
        lat: currentLocation?.latitude || 25.4419,
        lng: currentLocation?.longitude || 75.6597,
        pincode: currentLocation?.pincode || "",
      };
      return (await api.get("/api/products", { params })).data;
    },
    enabled: !!currentLocation?.pincode,
  });

  const products = productsData?.products || [];

  const { data: layoutSections = [] } = useQuery<any[]>({
    queryKey: ["/api/layout/public", currentLocation?.pincode],
    queryFn: async () => (await api.get("/api/layout/public", { params: { pincode: currentLocation?.pincode } })).data,
    enabled: !!currentLocation?.pincode,
  });

  const handleBannerPress = (bannerItem: any) => {
  if (!bannerItem) return;

  // 1. Debugging के लिए (इसे बाद में हटा सकते हैं)
  console.log("🎯 Banner Clicked Data:", bannerItem);

  // 2. डेटा को सही जगह से निकालें (Directly from bannerItem)
  const productId = bannerItem.productId;
  const categoryId = bannerItem.categoryId;
  const deeplink = bannerItem.deeplink;

  // 3. Navigation Logic
  if (productId) {
    // पक्का करें कि आपके Navigator में नाम 'ProductDetails' ही है
    navigation.navigate('ProductDetails', { productId: productId });
  } 
  // handleBannerPress के अंदर categoryId वाला हिस्सा:
else if (categoryId) {
  navigation.navigate('CategoryDetails', { // 'CategoryProducts' की जगह 'CategoryDetails' करें अगर वही नाम है
    catId: categoryId, 
    catName: bannerItem.title || 'Category',
    pincode: currentLocation?.pincode, // यहाँ भी लोकेशन जोड़ें
    lat: currentLocation?.latitude,
    lng: currentLocation?.longitude
  });
  }
  else if (deeplink && deeplink.trim() !== "") {
    Linking.openURL(deeplink).catch(err => 
      console.error("❌ Link open karne mein error:", err)
    );
  } else {
    console.log("ℹ️ Is banner par koi action set nahi hai.");
  }
};
  // --- BANNERS ---
  const banners = useMemo(() => {
    const filtered = layoutSections.filter(s => ["main_banner", "flash_sale", "category_special"].includes(s.sectionType));
    
    // 🔥 यहाँ लगाओ पहला Console Log (यह बताएगा कि फिल्टर के बाद कितने बैनर मिले)
    
    if (filtered.length > 0) {
      console.log("DEBUG: First Banner Items ->", JSON.stringify(filtered[0].items, null, 2));
    }
    
    return filtered;
  }, [layoutSections]);

  // 🔥 दूसरा Console Log यहाँ लगाएं (API से आया कच्चा डेटा देखने के लिए)
  React.useEffect(() => {
    if (layoutSections.length > 0) {
      
    } else {
      console.log("DEBUG: No Layout Sections Received from API");
    }
  }, [layoutSections]);

  // HomeScreen.tsx के अंदर

const handleSelectCategory = (id: string | number) => {
  // 1. सही कैटेगरी ऑब्जेक्ट ढूँढें (नाम के लिए)
  const selectedCat = categories.find(c => String(c.id) === String(id));

  // 2. लोकेशन के साथ नेविगेट करें
  navigation.navigate("CategoryDetails", { 
    catId: id, 
    catName: selectedCat?.name || "Category",
    // 👇 ये वो जादुई लाइन्स हैं जो 400 Error को ख़त्म करेंगी
    pincode: currentLocation?.pincode,
    lat: currentLocation?.latitude,
    lng: currentLocation?.longitude
  });
};

  // --- FLATLIST SECTIONS ---
  // 🎯 फिक्स 1: डेटा ग्रिड में भेजने से पहले हर प्रोडक्ट के 'variants' से बेस प्राइस निकालना भाई!
  const sections = useMemo(() => {
    const list = [];
    
    // 1. HEADER (Top Home Banner)
    const topBanners = layoutSections.find(s => s.sectionType === 'HERO_BANNER')?.items || [];
    list.push({ 
      type: 'HEADER_CONTENT', 
      banners: topBanners 
    });

    // 2. STICKY CONTROLS (Search + Categories)
    list.push({ type: 'STICKY_CONTROLS' });

    // 🗺️ प्रोडक्ट्स को नए मल्टी-वैरिएंट आर्किटेक्चर के लिए मैप करो भाई
  const normalizedProducts = products.map((p: any) => {
      const variantsList = p.variants || [];
      
      // ==================== 🎯 100% बुलेटप्रूफ होम स्क्रीन डबल-की डिस्काउंट इंजन ====================
      let basePrice = Number(p.price || 0);
      
      // 🌟 कड़क सुधार 1: मुख्य प्रोडक्ट लेवल पर mrp और originalPrice दोनों को पकड़ा भाई साहब
      let baseMrp = Number(p.mrp || p.originalPrice || 0);

      if (variantsList.length > 0) {
        // सबसे पहले वो वैरिएंट ढूँढो जिसकी कीमत सबसे कम (Minimum Price) है भाई साहब
        const lowestVariant = variantsList.reduce((min: any, v: any) => 
          Number(v.price || 0) < Number(min.price || 0) ? v : min, 
          variantsList[0]
        );

        basePrice = Number(lowestVariant?.price || basePrice);
        
        // 🌟 कड़क सुधार 2: वैरिएंट के अंदर भी दोनों चाबियों (mrp / originalPrice) को सुरक्षित रूप से पकड़ा
        baseMrp = Number(lowestVariant?.mrp || lowestVariant?.originalPrice || baseMrp);
      }

      // साइकोलॉजी रूल: ₹100 से कम बचत पर Percentage OFF, ज़्यादा बचत पर FLAT ₹ OFF भाई साहब
      const savings = baseMrp - basePrice;
      let calculatedDiscountText = '';
      if (baseMrp > basePrice && savings > 0) {
        if (savings < 100) {
          const percentOff = Math.round((savings / baseMrp) * 100);
          calculatedDiscountText = `${percentOff}% OFF`;
        } else {
          calculatedDiscountText = `Flat ₹${Math.round(savings)} OFF`;
        }
      }

      return {
        ...p,
        price: basePrice, // रेंडरिंग के लिए फ्लैट की
        mrp: baseMrp,     // ✅ कड़क सुधार: कटी हुई लाइन दिखाने के लिए फ्लैट MRP चाबी जोड़ी
        originalPrice: String(baseMrp), // बैकवर्ड सेफ़्टी के लिए पुरानी की को भी जिंदा रखा भाई
        discountText: calculatedDiscountText, // ✅ कड़क सुधार: यूआई कार्ड के लिए पहले से ही टेक्स्ट तैयार कर दिया भाई साहब
        hasMultipleVariants: variantsList.length > 1
      };
    });

    // 3. TRENDING PRODUCTS
    if (normalizedProducts.length > 0) {
      list.push({ type: 'TRENDING', products: normalizedProducts });
    }

    // 4. FLASH SALE AD (Middle Banner)
    const flashSale = layoutSections.find(s => s.sectionType === 'flash_sale')?.items || [];
    if (flashSale.length > 0) {
      list.push({ type: 'BANNER_AD', data: flashSale });
    } 

    // 5. CATEGORY-WISE SECTIONS
    const categorySpecial = layoutSections.find(s => s.sectionType === 'category_special')?.items || [];
    let visibleCategoryCount = 0;

    categories.forEach((cat) => {
      // कैटेगरी के हिसाब से फ़िल्टर भी सुधरे हुए प्रोडक्ट्स में से करो भाई
      const catProds = normalizedProducts.filter((p: any) => String(p.categoryId) === String(cat.id));
      
      if (catProds.length > 0) {
        visibleCategoryCount++;

        list.push({ 
          type: 'CATEGORY_SECTION', 
          data: cat, 
          products: catProds.slice(0, 6) 
        });

        if (visibleCategoryCount === 2 && categorySpecial.length > 0) {
          list.push({ 
            type: 'BANNER_AD', 
            data: categorySpecial,
            extraSpacing: true
          });
        }
      }
    });

    return list;
  }, [categories, products, layoutSections]);
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <AddressModal
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        currentLocation={currentLocation || undefined}
      />

      {productsLoading && products.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, index) => `home-sec-${index}`}
          stickyHeaderIndices={[1]} // 🔥 जादुई लाइन: इंडेक्स 1 (Sticky Controls) हमेशा टॉप पर रहेगा
          showsVerticalScrollIndicator={false}
          onRefresh={refetchProducts}
          refreshing={productsLoading}
        renderItem={({ item }: { item: any }) => {
  switch (item.type) {
    case 'HEADER_CONTENT':
      return (
        <View style={{ backgroundColor: '#fff' }}>
          <HomeHeader 
            cartCount={cartCount} 
            onPressLocation={() => setIsAddressModalVisible(true)} 
          />
          {/* ✅ अब यहाँ सिर्फ 'Top Banners' दिखेंगे, कोई फालतू लूप नहीं */}
          {item.banners && item.banners.length > 0 ? (
            <BannerCarousel banners={item.banners} 
           onPress={(banner) => handleBannerPress(banner)} 

            />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}
        </View>
      );

    case 'BANNER_AD':
  return (
    <View style={{ marginVertical: 10 }}>
      <BannerCarousel 
        banners={item.data || []}
        // ✅ यहाँ बदलाव करें: 'clickedItem' वो डेटा है जो BannerCarousel से आ रहा है
        onPress={(clickedItem) => handleBannerPress(clickedItem)} 
      />
    </View>
  );

    case 'STICKY_CONTROLS':
      return (
        <View style={styles.stickyWrapper}>
          <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => navigation.navigate('Search', {
          // सर्च में भी लोकेशन भेजना बहुत ज़रूरी है
          pincode: currentLocation?.pincode,
          lat: currentLocation?.latitude,
          lng: currentLocation?.longitude
        })}
      >
        <View pointerEvents="none">
           <SearchBar />
        </View>
      </TouchableOpacity>
          <CategoryScroller
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
          />
        </View>
      );

   case 'TRENDING':
      // 🎯 फिक्स 2: फ्लैट प्राइज्ड सुधरे हुए प्रोडक्ट्स को ट्रेंडिंग ग्रिड में पास किया भाई
      return <TrendingSection products={item.products} numColumns={3} />;
    
    case 'CATEGORY_SECTION':
      // 🎯 फिक्स 3: कैटेगरी सेक्शन के अंदर भी नया वैलिडेटेड डेटा मैप होगा भाई
      return (
        <CategorySection 
          category={item.data} 
          products={item.products} 
          numColumns={3} 
        />
      );
      
    default:
      return null;
  }
}}
         
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  stickyWrapper: { 
    backgroundColor: "#fff", 
    paddingBottom: 5,
    // Android Shadow
    elevation: 4,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerPlaceholder: { 
    height: 180, 
    backgroundColor: '#f1f5f9', 
    marginHorizontal: 20, 
    marginVertical: 10, 
    borderRadius: 24 
  },
});