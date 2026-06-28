import React, {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import ProductGrid from "../../components/ProductGrid";
interface Props {
  category: any;
  subCategories: any[];
  currentLocation?: any;
}
const SubCategorySection: React.FC<Props> = ({
  category,
  subCategories,
  currentLocation,
}) => {
const navigation = useNavigation<any>();
const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const horizontalRef = useRef<FlatList>(null);
const verticalRef = useRef<FlatList>(null);
const [selectedSubCategory, setSelectedSubCategory] =
    useState(
      subCategories?.[0]?.id
    );
const toggleSection = (id: number) => {

    setExpandedSections(prev =>

        prev.includes(id)

            ? prev.filter(x => x !== id)

            : [...prev, id]

    );

};
const scrollToSection = (
    index: number,
    id: number
  ) => {
 setSelectedSubCategory(id);
  verticalRef.current?.scrollToIndex({
      index,
      animated: true,
    });
 };
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (!viewableItems.length) return;
      const current =
              viewableItems[0]?.item;
if (!current) return;
     setSelectedSubCategory(current.id);
     const chipIndex =
        subCategories.findIndex(
          s => s.id === current.id
        );
      if (chipIndex >= 0) {
       horizontalRef.current?.scrollToIndex({
          index: chipIndex,
          animated: true,
          viewPosition: 0.4,
        });
    }
    }  );
  const viewabilityConfig = {
   itemVisiblePercentThreshold: 40,
  };
 const renderChip = ({
    item,
    index,
  }: any) => {

    const selected =
      item.id === selectedSubCategory;
    return (
      <TouchableOpacity
       activeOpacity={0.9}
       onPress={() =>
          scrollToSection(index, item.id)
        }
       style={[
          styles.chip,

          selected &&
            styles.selectedChip,
        ]}
      >
       <Text
          style={[
            styles.chipText,

            selected &&
              styles.selectedChipText,
          ]}        >
         {item.name}
       </Text>
     </TouchableOpacity>
   );
 };
 const renderSection = ({
    item,
  }: any) => {
     console.log(
    "🔥 RENDERING SUBCATEGORY:",
    item.name,
    "Products:",
    item.products?.length
  );
    const expanded = expandedSections.includes(item.id);
  const visibleProducts = expanded ? item.products : (item.products?.slice(0, 6) || []);
  console.log(
    "🔥 PRODUCT GRID DATA:",
    item.name,
    visibleProducts?.length
  );
    return (
      <View
        style={styles.section} >
       <View
          style={styles.sectionHeader}  >
         <View>
           <Text
              style={styles.sectionTitle} >
              {item.name}
            </Text>
            <Text
              style={styles.sectionCount} >
             {item.productCount || item.products?.length || 0}
              {" "}Products
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => {
            navigation.navigate("CategoryDetails", {
  catId: category.id,
  catName: category.name,
  selectedSubCategoryId: item.id,
  pincode: currentLocation?.pincode,
  lat: currentLocation?.latitude,
  lng: currentLocation?.longitude,
});
            }}       >
            <Text
              style={styles.viewAll}
            >
              View All →
            </Text>
          </TouchableOpacity>
        </View>
    <ProductGrid
    products={visibleProducts}
    numColumns={3}
    compact
    showSeller={false}
/>
{item.products.length > 6 && (
  <TouchableOpacity
    style={styles.showMoreButton}
    onPress={() => toggleSection(item.id)} >
    <Text style={styles.showMoreText}>
      {expanded
        ? "▲ Show Less"
        : `▼ Show ${item.products.length - 6} More Products`}
    </Text>
  </TouchableOpacity>
)}
      </View>
    );
  };
  return (
    <View
      style={styles.container}
    >
      <FlatList
        ref={horizontalRef}
        horizontal
        data={subCategories}
        keyExtractor={i =>
          i.id.toString()        }
        renderItem={renderChip}
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
        }}
        style={styles.stickyBar}     />
      <FlatList
        ref={verticalRef}
        data={subCategories}
        keyExtractor={i =>
          i.id.toString()
        }
        renderItem={renderSection}
        showsVerticalScrollIndicator={
          false
        }
        onViewableItemsChanged={
          onViewableItemsChanged.current
        }
        viewabilityConfig={
          viewabilityConfig
        }
      />
    </View>
  );};
// ... (apka sara SubCategorySection code yahan khatam ho raha hai)

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  stickyBar: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginRight: 8, 
    borderRadius: 20, 
    backgroundColor: '#f1f5f9' 
  },
  selectedChip: { 
    backgroundColor: '#2563eb' 
  },
  chipText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#64748b' 
  },
  selectedChipText: { 
    color: '#fff' 
  },
  section: { 
    padding: 16, 
    paddingTop: 60 // Sticky bar ke liye space
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  sectionCount: { 
    fontSize: 12, 
    color: '#94a3b8' 
  },
  viewAll: { 
    fontSize: 14, 
    color: '#2563eb', 
    fontWeight: '600' 
  },
  showMoreButton: {

  marginTop: 12,

  alignSelf: "center",

  backgroundColor: "#eef4ff",

  paddingHorizontal: 18,

  paddingVertical: 10,

  borderRadius: 30,

},

showMoreText: {

  fontSize: 14,

  fontWeight: "700",

  color: "#2563eb",

},
});
export default SubCategorySection;