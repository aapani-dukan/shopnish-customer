import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from "@tanstack/react-query";
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";

// Components
import HomeHeader from "./HomeHeader";
import SearchBar from "./SearchBar";
import CategoryScroller from "./CategoryScroller";
import BannerCarousel from "./BannerCarousel";
import CategorySection from "./CategorySection";
import SubCategorySection from "./SubCategorySection";
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
  useEffect(() => {
}, [selectedCategoryId]);
  // --- API DATA ---
  const { data: rawCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => (await api.get("/api/categories")).data,
  });
//console.log(JSON.stringify(rawCategories, null, 2));
  const categories = useMemo(() => rawCategories.map((c: any) => ({
    id: c.id || c._id,
    name: c.name,
    icon: c.icon,
    image: c.image,
    shops: c.shops || [],
  })), [rawCategories]);

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery<any>({
    queryKey: ["/api/home-products", currentLocation?.pincode],
    queryFn: async () => {
      const params = {
        lat: currentLocation?.latitude || 25.4419,
        lng: currentLocation?.longitude || 75.6597,
        pincode: currentLocation?.pincode || "",
      };
      return (await api.get("/api/home-products", { params })).data;
    },
    enabled: !!currentLocation?.pincode,
  });

  const products = productsData?.products || [];
  const recommendedProducts =
  productsData?.recommendedProducts || [];

const trendingProductsAI =
  productsData?.trendingProducts || [];

const recentlyViewedProducts =
  productsData?.recentlyViewedProducts || [];
  console.log("🔥 HOME API RESPONSE =", productsData);
console.log("🔥 PRODUCTS LENGTH =", products.length);

  const { data: layoutSections = [] } = useQuery<any[]>({
    queryKey: ["/api/layout/public", currentLocation?.pincode],
    queryFn: async () => (await api.get("/api/layout/public", { params: { pincode: currentLocation?.pincode } })).data,
    enabled: !!currentLocation?.pincode,
  });


const { data: subCategories = [], isLoading: subLoading } = useQuery({
  queryKey: ["/api/categories/subcategories", selectedCategoryId],
  queryFn: async () => {
    console.log(
      "🔥 FETCHING SUBCATEGORIES FOR =",
      selectedCategoryId
    );
    if (!selectedCategoryId) return [];
    const res = await api.get(
      `/api/categories/${selectedCategoryId}/subcategories`
    );
   console.log(
      "🔥 API RESPONSE =",
      res.data
    );

    console.log(
      "🔥 SUBCATEGORY COUNT =",
      res.data?.subCategories?.length
    );
    return res.data.subCategories || [];
  },
  enabled: !!selectedCategoryId,
});
useFocusEffect(
  React.useCallback(() => {
    console.log("HOME FOCUSED");

    setSelectedCategoryId(null);

    return () => {};
  }, [])
);
useEffect(() => {
  console.log(
    "🔥 QUERY DATA CHANGED =",
    subCategories
  );
}, [subCategories]);
useEffect(() => {
  console.log(
    "🔥 TYPE CHECK",
    Array.isArray(subCategories),
    subCategories
  );
}, [subCategories]);
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
  console.log("🔥 CATEGORY CLICKED =", id);
 setSelectedCategoryId(Number(id));
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
list.push({ type: "STICKY_CONTROLS" });

// Selected Category Object निकालो
const selectedCategory = categories.find(
  (c: any) => String(c.id) === String(selectedCategoryId)
);
console.log(
  "🔥 BEFORE PUSH",
  selectedCategory?.name,
  Array.isArray(subCategories),
  subCategories?.length,
  subCategories
);
// अब पूरा SubCategory Section जोड़ो
if (selectedCategoryId && subCategories.length > 0) {
  console.log("🔥 PUSHING SUBCATEGORY_SECTION");

  list.push({
    type: "SUBCATEGORY_SECTION",
    category: selectedCategory || {
      id: selectedCategoryId,
      name: "Category",
    },
    subCategories,
  });
}
const normalizeProducts = (list: any[]) =>
  list.map((p: any) => {
    const variantsList = p.variants || [];

    let basePrice = Number(p.price || 0);
    let baseMrp = Number(p.mrp || p.originalPrice || 0);

    if (variantsList.length > 0) {
      const lowestVariant = variantsList.reduce(
        (min: any, v: any) =>
          Number(v.price || 0) <
          Number(min.price || 0)
            ? v
            : min,
        variantsList[0]
      );

      basePrice = Number(lowestVariant.price || basePrice);

      baseMrp = Number(
        lowestVariant.mrp ||
        lowestVariant.originalPrice ||
        baseMrp
      );
    }

    const savings = baseMrp - basePrice;

    let discountText = "";

    if (baseMrp > basePrice && savings > 0) {

      if (savings < 100) {

        discountText =
          `${Math.round(
            savings / baseMrp * 100
          )}% OFF`;

      } else {

        discountText =
          `Flat ₹${Math.round(savings)} OFF`;

      }

    }

    return {
      ...p,
      price: basePrice,
      mrp: baseMrp,
      originalPrice: String(baseMrp),
      discountText,
      hasMultipleVariants:
        variantsList.length > 1,
    };
  });
    // 🗺️ प्रोडक्ट्स को नए मल्टी-वैरिएंट आर्किटेक्चर के लिए मैप करो भाई
  const normalizedProducts =
  normalizeProducts(products);

const normalizedRecommended =
  normalizeProducts(recommendedProducts);

const normalizedTrending =
  normalizeProducts(trendingProductsAI);

const normalizedRecentlyViewed =
  normalizeProducts(recentlyViewedProducts);
// 🎯 यूनीक लोकल दुकानें निकालो  प्रचार के लिए
    const localShopsList: any[] = [];
    let shopIndex = 0;

const nextShop = () => {
   if(localShopsList.length===0) return null;

   const shop =
      localShopsList[
         shopIndex % localShopsList.length
      ];

   shopIndex++;

   return shop;
};

    const shopsSeen: any = {};
    normalizedProducts.forEach((p: any) => {
      if (p.seller && p.seller.id && !shopsSeen[p.seller.id]) {
        shopsSeen[p.seller.id] = true;
        localShopsList.push({
          id: p.seller.id,
          businessName: p.seller.businessName || "Local Trusted Store",
          businessAddress: p.seller.businessAddress || "Nearby Main Market, Bundi",
        });
      }
    });
    
// 3. TRENDING PRODUCTS ENGINE: सीधा कड़क 21 प्रोडक्ट्स (7 लाइन्स) 
   
// =======================================
// AI RECOMMENDATION SECTIONS
// =======================================

if (normalizedRecommended.length > 0) {
  list.push({
    type: "RECOMMENDED_PRODUCTS",
    title: "Recommended for You",
    products: normalizedRecommended.slice(0, 18),
  });
  const shop=nextShop();

   if(shop){
      list.push({
         type:"LOCAL_SHOP_BANNER",
         shop
      });
   }
}

if (normalizedTrending.length > 0) {
  list.push({
    type: "TRENDING_PRODUCTS_AI",
    title: "Trending Products",
    products: normalizedTrending.slice(0, 18),
  });
  const shop=nextShop();

   if(shop){
      list.push({
         type:"LOCAL_SHOP_BANNER",
         shop
      });
   }
}

if (normalizedRecentlyViewed.length > 0) {
  list.push({
    type: "RECENTLY_VIEWED_PRODUCTS",
    title: "Recently Viewed",
    products: normalizedRecentlyViewed.slice(0, 18),
  });
  const shop=nextShop();

   if(shop){
      list.push({
         type:"LOCAL_SHOP_BANNER",
         shop
      });
   }
}


    // 4. FLASH SALE AD (Middle Banner)
    const flashSale = layoutSections.find(s => s.sectionType === 'flash_sale')?.items || [];
    if (flashSale.length > 0) {
      list.push({ type: 'BANNER_AD', data: flashSale });
    }
    // 5. CATEGORY-WISE SECTIONS (यहाँ भी प्रोडक्ट्स को सुधारे हुए ढंग से सिंक किया भाई)
    const categorySpecial = layoutSections.find(s => s.sectionType === 'category_special')?.items || [];
    let visibleCategoryCount = 0;
   categories.forEach((cat) => {
      const catProds = normalizedProducts.filter((p: any) => String(p.categoryId) === String(cat.id));
      if (catProds.length > 0) {
        visibleCategoryCount++;
        list.push({ 
          type: 'CATEGORY_SECTION', 
          data: cat, 
          products: catProds.slice(0, 21) // यहाँ भी कैटेगरी वाइज़ ग्रिड को सीधे 21 प्रोडक्ट्स पर सेट किया
        });
        const shop=nextShop();

if(shop){

   list.push({
      type:"LOCAL_SHOP_BANNER",
      shop
   });

}

        if (visibleCategoryCount === 2 && categorySpecial.length > 0) {
          list.push({ type: 'BANNER_AD', data: categorySpecial, extraSpacing: true });
        }
      }
    });
console.log(
  "🔥 FINAL SECTIONS =",
  list.map(x => x.type)
);
    return list;
 }, [
  categories,
  products,
  layoutSections,
  selectedCategoryId,
  subCategories
]);
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
          console.log(
    "🔥 RENDER ITEM TYPE =",
    item.type
  );
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
      case "SUBCATEGORY_SECTION":
        console.log(
  "🔥 SUBCATEGORY_SECTION RENDERED",
  item.subCategories?.length
);
  return (

    <SubCategorySection
      category={item.category}
      subCategories={item.subCategories}
      currentLocation={currentLocation}
    />
  );
case "RECOMMENDED_PRODUCTS":
  return (
    <TrendingSection
      title={item.title}
      products={item.products}
      numColumns={3}
      currentLocation={currentLocation}
    />
  );

case "TRENDING_PRODUCTS_AI":
  return (
    <TrendingSection
      title={item.title}
      products={item.products}
      numColumns={3}
      currentLocation={currentLocation}
    />
  );

case "RECENTLY_VIEWED_PRODUCTS":
  return (
    <TrendingSection
      title={item.title}
      products={item.products}
      numColumns={3}
      currentLocation={currentLocation}
    />
  );
  case 'TRENDING':
  return (
    <TrendingSection
      products={item.products}
      numColumns={3}
      currentLocation={currentLocation}
    /> );
     // 🏪 नया ब्लॉक: स्थानीय दुकानों का सुंदर प्रचार विज्ञापनी कार्ड (Bundi Specials USP)
    case 'LOCAL_SHOP_BANNER':
      return (
        <TouchableOpacity 
          style={{
            marginHorizontal: 16, marginVertical: 10, padding: 14, backgroundColor: '#fff', borderRadius: 16,
            borderWidth: 1.5, borderColor: '#e0e7ff', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3
          }}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ShopDetails', { sellerId: item.shop.id, shopName: item.shop.businessName })}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#4f46e5', backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>✦ LOCAL TRUSTED SHOP</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#10b981' }}>Nearby Market</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e1b4b', marginTop: 6 }}>{item.shop.businessName}</Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📍 {item.shop.businessAddress}</Text>
          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#4f46e5' }}>View Store Inventory & Fresh Stock ➔</Text>
          </View>
        </TouchableOpacity>
      );
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