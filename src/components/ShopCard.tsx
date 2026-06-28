import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  Star,
  Clock3,
  ChevronRight,
  Store,
} from "lucide-react-native";

interface ShopCardProps {
  shop: any;
  variant?: "recommended" | "normal" | "compact";
  onPress?: () => void;
}

const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  variant = "recommended",
  onPress,
}) => {

  const rating = Number(shop?.rating || 4.7);

  const deliveryTime =
    shop?.estimatedDeliveryTime ||
    shop?.deliveryTime ||
    "20-30 min";

  const totalProducts =
    shop?.productCount ||
    shop?.totalProducts ||
    0;

  const logo =
    shop?.logo ||
    shop?.image ||
    shop?.profileImage ||
    shop?.shopImage;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[
        styles.card,
        variant === "compact" && styles.compactCard,
      ]}
      onPress={onPress}
    >
      <View style={styles.row}>

        {/* Shop Logo */}

        <View style={styles.logoContainer}>
          {logo ? (
            <Image
              source={{ uri: logo }}
              style={styles.logo}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Store
                size={28}
                color="#4f46e5"
              />
            </View>
          )}
        </View>

        {/* Shop Info */}

        <View style={styles.info}>

          <Text
            style={styles.shopName}
            numberOfLines={1}
          >
            {shop?.businessName ||
              shop?.name ||
              "Local Shop"}
          </Text>

          <Text
            style={styles.category}
            numberOfLines={1}
          >
            {shop?.categoryName ||
              "Local Store"}
          </Text>

          <View style={styles.metaRow}>

            <View style={styles.metaItem}>
              <Star
                size={13}
                color="#f59e0b"
                fill="#f59e0b"
              />

              <Text style={styles.metaText}>
                {rating.toFixed(1)}
              </Text>
            </View>

            <View style={styles.dot} />

            <View style={styles.metaItem}>
              <Clock3
                size={13}
                color="#16a34a"
              />

              <Text style={styles.metaText}>
                {deliveryTime}
              </Text>
            </View>

          </View>

          <Text style={styles.productCount}>
            {totalProducts} Products
          </Text>

        </View>

        {/* Right */}

        <View style={styles.rightSection}>

          <View style={styles.openBadge}>
            <Text style={styles.openText}>
              OPEN
            </Text>
          </View>

          <ChevronRight
            size={20}
            color="#94a3b8"
          />

        </View>

      </View>

      {/* Bottom Banner */}

      {variant !== "compact" && (

        <View style={styles.bottomBar}>

          <Text style={styles.bottomText}>
            View complete shop →
          </Text>

        </View>

      )}

    </TouchableOpacity>
  );
};

export default ShopCard;

const styles = StyleSheet.create({

  card: {

    backgroundColor: "#fff",

    borderRadius: 18,

    marginHorizontal: 12,

    marginVertical: 8,

    padding: 14,

    borderWidth: 1,

    borderColor: "#eef2f7",

    elevation: 3,

  },

  compactCard: {

    marginHorizontal: 0,

  },

  row: {

    flexDirection: "row",

    alignItems: "center",

  },

  logoContainer: {

    marginRight: 12,

  },

  logo: {

    width: 70,

    height: 70,

    borderRadius: 16,

  },

  logoPlaceholder: {

    width: 70,

    height: 70,

    borderRadius: 16,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#eef2ff",

  },

  info: {

    flex: 1,

  },

  shopName: {

    fontSize: 16,

    fontWeight: "800",

    color: "#111827",

  },

  category: {

    fontSize: 12,

    color: "#64748b",

    marginTop: 2,

  },

  metaRow: {

    flexDirection: "row",

    alignItems: "center",

    marginTop: 8,

  },

  metaItem: {

    flexDirection: "row",

    alignItems: "center",

  },

  metaText: {

    marginLeft: 4,

    fontSize: 12,

    fontWeight: "700",

    color: "#334155",

  },

  dot: {

    width: 5,

    height: 5,

    borderRadius: 10,

    backgroundColor: "#cbd5e1",

    marginHorizontal: 8,

  },

  productCount: {

    marginTop: 8,

    fontSize: 12,

    color: "#2563eb",

    fontWeight: "700",

  },

  rightSection: {

    alignItems: "center",

    justifyContent: "space-between",

    height: 70,

  },

  openBadge: {

    backgroundColor: "#dcfce7",

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 8,

  },

  openText: {

    color: "#16a34a",

    fontWeight: "800",

    fontSize: 10,

  },

  bottomBar: {

    marginTop: 14,

    paddingTop: 10,

    borderTopWidth: 1,

    borderTopColor: "#f1f5f9",

  },

  bottomText: {

    color: "#2563eb",

    fontWeight: "700",

    fontSize: 13,

  },

});