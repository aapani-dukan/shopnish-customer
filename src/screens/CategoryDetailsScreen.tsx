import React, { useState,useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useQuery,keepPreviousData,useInfiniteQuery } from '@tanstack/react-query';
import api from '../services/api';
import ProductGrid from '../components/ProductGrid';
import ShopCard from '../components/ShopCard';
const { width } = Dimensions.get('window');

export default function CategoryDetailsScreen({ route, navigation }: any) {
  const { catId, catName, selectedSubCategoryId, pincode, lat, lng } = route.params || {};

  // स्टेट लॉक: कौन सी सब-कैटेगरी चुनी हुई है (All = सब कुछ मिक्स दिखेगा)
  const [selectedSubCatId, setSelectedSubCatId] = useState(selectedSubCategoryId || "All");
const [showAllShops, setShowAllShops] = useState(false);
  // 1. सब-कैटेगरीज फेचिंग इंजन (डेटाबेस से हिंदी और इंग्लिश नाम सीधे बाहर)
 const {
  data: subCategoryResponse,
  isLoading: subLoading,
} = useQuery({
  queryKey: ['subcategories', 'category', catId],
  queryFn: async () => {
    const res = await api.get(
      `/api/categories/${catId}/subcategories`
    );

    return res.data;
  },
});

const subCategories =
  subCategoryResponse?.subCategories || [];

const allCategoryShops =
  subCategoryResponse?.allCategoryShops || [];
 // 2. Products Loading
 const {
  data,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: [
    "products",
    catId,
    pincode,
    lat,
    lng,
    selectedSubCatId
  ],

  initialPageParam: 1,

  queryFn: async ({ pageParam }) => {
    const res = await api.get("/api/products/category-products", {
      params: {
        categoryId: catId,
        subCategoryId: selectedSubCatId === "All" ? null : selectedSubCatId,
        pincode: pincode || "",
        lat: lat || 0,
        lng: lng || 0,
        page: pageParam,
        limit: 30,
      },
    });

    return res.data;
  },

  getNextPageParam: (lastPage) => {
    if (lastPage.page < lastPage.totalPages) {
      return lastPage.page + 1;
    }

    return undefined;
  },
});
const products = useMemo(() => {
  return (
    data?.pages.flatMap((page: any) => page.products) || []
  );
}, [data]);

  // 3. लोकल मार्केट्स की दुकानें (Unique Shops Extractor)
  const uniqueShops = useMemo(() => {
    const shopsMap: any = {};
    products.forEach((p: any) => {
      if (p.seller && p.seller.id && !shopsMap[p.seller.id]) {
        shopsMap[p.seller.id] = {
          id: p.seller.id,
          businessName: p.seller.businessName || "Local Verified Shop",
          businessAddress: p.seller.businessAddress || "Nearby Local Market",
          distance: lat && lng ? "0.5 KM away" : "Nearby"
        };
      }
    });
    return Object.values(shopsMap);
  }, [products, lat, lng]);

  // 4. सुधरे हुए प्रोडक्ट्स की प्रोसेसिंग और यूनिवर्सल डिस्काउंट सिंक
  console.log(
  "🔥 CATEGORY PRODUCTS =",
  products.map((p:any) => ({
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    subCategoryId: p.subCategoryId
  }))
);
  const processedProducts = useMemo(() => {
    return products.map((p: any) => {
      const variantsList = p.variants || [];
      let basePrice = Number(p.price || 0);
      let baseMrp = Number(p.mrp || p.originalPrice || 0);

      if (variantsList.length > 0) {
        const lowestVariant = variantsList.reduce((min: any, v: any) => 
          Number(v.price || 0) < Number(min.price || 0) ? v : min, variantsList[0]
        );
        basePrice = Number(lowestVariant?.price || basePrice);
        baseMrp = Number(lowestVariant?.mrp || lowestVariant?.originalPrice || baseMrp);
      }

      const savings = baseMrp - basePrice;
      let discountText = '';
      if (baseMrp > basePrice && savings > 0) {
        if (savings < 100) {
          discountText = `${Math.round((savings / baseMrp) * 100)}% OFF`;
        } else {
          discountText = `Flat ₹${Math.round(savings)} OFF`;
        }
      }

      return { ...p, price: basePrice, mrp: baseMrp, discountText, hasMultipleVariants: variantsList.length > 1 };
    });
  }, [products]);
  console.log("TOTAL PRODUCTS =", processedProducts.length);

console.log(
  processedProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    subCategoryId: p.subCategoryId,
  }))
);
const exploreShops = useMemo(() => {
  return uniqueShops.slice(0, 6);
}, [uniqueShops]);
const uniqueSubCategories = useMemo(() => {
  const map = new Map();

  subCategories.forEach((item: any) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}, [subCategories]);
  // 5. मखमली सब-कैटेगरी वाइज़ स्ट्रक्चर बिल्डिंग (अधिकतम 21 आइटम्स + दुकान इंसर्शन लॉजिक)
  const pageSections = useMemo(() => {
  const list: any[] = [];
  let shopCounter = 0; // ✅ डिक्लेयर करना ज़रूरी है!

  // 1. फिल्टर लॉजिक: अगर 'All' है तो सब, नहीं तो सिर्फ चुनी हुई सब-कैटेगरी
  const targetSubCats = (selectedSubCatId === null || selectedSubCatId === 'All')
    ? subCategories 
    : subCategories.filter((s: any) => String(s.id) === String(selectedSubCatId));

  // 2. लूप चलाएं
  targetSubCats.forEach((sub: any) => {
    const subProds = processedProducts.filter((p: any) => 
      String(p.subCategoryId) === String(sub.id)
    );
      
    if (subProds.length > 0) {
      list.push({
        type: 'SUBCAT_SECTION',
        id: sub.id,
        title: sub.name,
        titleHindi: sub.nameHindi || '',
        products: subProds,
        hasMore: false
      });

      // 3. दुकान का विज्ञापन (shopCounter का यूज़)
      if (uniqueShops.length > 0) {
        const currentShop = uniqueShops[shopCounter % uniqueShops.length];
        list.push({ type: 'SHOP_AD', shop: currentShop });
        shopCounter++; // ✅ हर बार काउंटर बढ़ाएं
      }
    }
  });

  // 4. फॉलबैक (अगर लिस्ट खाली है)
  if (
  (selectedSubCatId === null || selectedSubCatId === "All") &&
  list.length === 0 &&
  processedProducts.length > 0
) {
    list.push({
      type: 'SUBCAT_SECTION',
      id: 'general',
      title: 'All Products',
      titleHindi: 'सभी उत्पाद',
      products: processedProducts,
      hasMore: false
    });
  }

if (
  selectedSubCatId !== null &&
  selectedSubCatId !== "All" &&
  list.length === 0
) {
  list.push({
    type: "EMPTY_SUBCATEGORY",
    id: "empty",
  });
}
  return list;
}, [subCategories, processedProducts, selectedSubCatId, uniqueShops]); // ✅ अब यह correctly डिपेंडेंट है

  if (isLoading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
    );
  }
if (showAllShops) {

  return (

    <View style={styles.container}>

      <View style={styles.topHeader}>

        <TouchableOpacity
          onPress={() => setShowAllShops(false)}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {catName} Shops
        </Text>

        <View style={{ width: 40 }} />

      </View>

      <FlatList
        data={allCategoryShops}
        keyExtractor={(item) =>
          item.id.toString()
        }

        contentContainerStyle={{
          padding:16,
          paddingBottom:80
        }}

        renderItem={({ item }) => (

          <ShopCard

            shop={item}

            onPress={() =>
              navigation.navigate(
                "ShopDetails",
                {
                  sellerId:item.id,
                  shopName:item.businessName,
                }
              )
            }

          />

        )}

      />

    </View>

  );

}

  return (
    <View style={styles.container}>
     
  
      {/* 2. SPLIT LAYOUT BODY (Left Sidebar + Right Products Grid) */}
      <View style={styles.splitBody}>

        {/* LAFT VERTICAL SIDEBAR: सब-कैटेगरीज हिंदी + इंग्लिश नाम की मखमली पट्टी */}
        <View style={styles.sidebar}>
          <FlatList
           data={[
  { id: 'All', name: 'All Menu', nameHindi: 'सब कुछ' },
  ...uniqueSubCategories
]}
            keyExtractor={(item) => `side-${item.id}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
             const isSelected = item.id === 'All' 
  ? selectedSubCatId === null 
  : String(item.id) === String(selectedSubCatId);
              return (
                <TouchableOpacity 
                // 1. onPress में बदलाव
onPress={() => setSelectedSubCatId(item.id === 'All' ? null : item.id)}

                >
                  <Text style={[styles.sideTextEng, isSelected && styles.sideTextActive]}>{item.name}</Text>
                  {item.nameHindi ? (
                    <Text style={[styles.sideTextHindi, isSelected && styles.sideTextActive]}>{item.nameHindi}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* RIGHT SIDE MAIN CONTENT FEED */}
        <View style={styles.mainFeed}>
          <FlatList
            data={pageSections}
            onEndReached={() => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}}

onEndReachedThreshold={0.5}
            keyExtractor={(item, index) => `sec-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
   ListFooterComponent={
  <>
    {isFetchingNextPage && (
      <ActivityIndicator
        size="large"
        color="#2563eb"
        style={{ marginVertical: 20 }}
      />
    )}

  </>
}
            renderItem={({ item }) => {
              if (item.type === "EMPTY_SUBCATEGORY") {
    return (
      <View
        style={{
          paddingVertical: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: "#64748b",
            fontWeight: "600",
          }}
        >
          इस Sub Category में अभी कोई Product उपलब्ध नहीं है।
        </Text>
      </View>
    );
  }
              
              // A. सब-कैटेगरी उत्पाद सेक्शन (3-3 ग्रिड)
              if (item.type === 'SUBCAT_SECTION') {
                return (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <View>
                        <Text style={styles.sectionTitleEng}>{item.title}</Text>
                        {item.titleHindi ? <Text style={styles.sectionTitleHindi}>{item.titleHindi}</Text> : null}
                      </View>
                    </View>

                    {/* ३-३ के कड़क ग्रिड में रेंडरिंग */}
                 <ProductGrid
    products={item.products}
    numColumns={3}
    compact
    showSeller={false}
/>
{item.recommendedShop && (

    <View
        style={{
            marginTop:18
        }}
    >

        <Text
            style={{
                fontSize:16,
                fontWeight:"800",
                marginBottom:10
            }}
        >
            Recommended Shop
        </Text>

        <ShopCard

            shop={item.recommendedShop}

            variant="recommended"

            onPress={()=>

                navigation.navigate(
                    "ShopDetails",
                    {
                        sellerId:
                        item.recommendedShop.id
                    }
                )

            }

        />

    </View>
)}

                    {/* MORE BUTTON BLOCK */}
                    {item.hasMore && (
                      <TouchableOpacity 
                        style={styles.moreButton}
                        onPress={() => {
                          setSelectedSubCatId(item.id);
                          alert(`${item.title} की पूरी लिस्ट लोड हो रही है भाई साहब!`);
                        }}
                      >
                        <Text style={styles.moreButtonText}>See More Items ➔</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
if (item.type === "SHOP_AD") {
  return (
    <View style={{ marginVertical: 15 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 10,
        }}
      >
        Recommended Shop
      </Text>

      <ShopCard
        shop={item.shop}
        variant="recommended"
        onPress={() =>
          navigation.navigate("ShopDetails", {
            sellerId: item.shop.id,
          })
        }
      />
    </View>
  );
}
            
              return null;
            }}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topHeader: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, 
    paddingTop: 45, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#1e293b', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', flex: 1, textAlign: 'center' },
  
  splitBody: { flex: 1, flexDirection: 'row' },
  
  // Left Sticky Sidebar Styles
  sidebar: { width: width * 0.20, backgroundColor: '#f8fafc', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  sideTab: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7', alignItems: 'center' },
  sideTabActive: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  sideTextEng: { fontSize: 12, fontWeight: '700', color: '#475569', textAlign: 'center' },
  sideTextHindi: { fontSize: 10, color: '#64748b', marginTop: 2, textAlign: 'center' },
  sideTextActive: { color: '#2563eb', fontWeight: '800' },
  
  // Right Feed Styles
  mainFeed: { flex: 1, backgroundColor: '#fff' },
  sectionBlock: { padding: 10, marginBottom: 15 },
  sectionHeader: { marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  sectionTitleEng: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  sectionTitleHindi: { fontSize: 12, color: '#64748b', marginTop: 1 },
  
  gridRow: { justifyContent: 'flex-start', gap: 6, marginBottom: 8 },
  productCard: { 
    width: (width * 0.76 - 32) / 3, backgroundColor: '#fff', borderRadius: 10, 
    padding: 6, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', position: 'relative' 
  },
  cardImageWrapper: { width: '100%', height: 75, backgroundColor: '#f8fafc', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  productImg: { width: '85%', height: '85%', resizeMode: 'contain' },
  productName: { fontSize: 11, fontWeight: '600', color: '#1e293b', marginTop: 5 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 3, marginTop: 4 },
  sellingPrice: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  mrpPrice: { fontSize: 9, color: '#94a3b8', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginTop: 4, alignSelf: 'flex-start' },
  discountText: { fontSize: 8, fontWeight: '700', color: '#16a34a' },
  
  moreButton: { paddingVertical: 8, backgroundColor: '#f8fafc', borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  moreButtonText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  
  // Local Shops Promotion Card Styles (USP)
  shopAdCard: { 
    marginHorizontal: 10, marginVertical: 8, padding: 12, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e0e7ff', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  shopAdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopAdTag: { fontSize: 9, fontWeight: '800', color: '#4f46e5', backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  shopDistance: { fontSize: 10, fontWeight: '700', color: '#10b981' },
  shopAdName: { fontSize: 16, fontWeight: '900', color: '#1e1b4b', marginTop: 6 },
  shopAdAddress: { fontSize: 11, color: '#64748b', marginTop: 2 },
  shopActionRow: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 6 },
  shopActionText: { fontSize: 11, fontWeight: '700', color: '#4f46e5' },
  footerContainer: {
  marginTop: 20,
  paddingBottom: 30,
},

footerTitle: {
  fontSize: 22,
  fontWeight: "900",
  marginHorizontal: 16,
  color: "#111827",
},

footerSubtitle: {
  marginHorizontal: 16,
  marginTop: 4,
  marginBottom: 12,
  color: "#64748b",
  fontSize: 13,
},

viewAllShopBtn: {
  marginHorizontal: 16,
  marginTop: 10,
  backgroundColor: "#eef2ff",
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
},

viewAllShopText: {
  color: "#4338ca",
  fontWeight: "800",
  fontSize: 15,
},
});