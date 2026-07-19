import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";
import { apiRequest } from "../lib/queryClient"; // अपनी API helper के हिसाब से path बदल लेना

export default function ReturnProductScreen({
  route,
  navigation,
}: any) {

  const { orderItem } = route.params;
 const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const [returnType, setReturnType] =
    useState<"shop" | "pickup">("shop");

  const mutation = useMutation({

    mutationFn: async () => {

      return apiRequest(
        "POST",
        "/api/returns/create",
        {

          orderItemId: orderItem.orderItemId,

          returnType,

          reason,

        }

      );

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderItem.orderId}/tracking`], });

      Alert.alert(
        "Success",
        "Return request submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );

    },

    onError: () => {

      Alert.alert(
        "Error",
        "Unable to submit return request."
      );

    },

  });

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={26} />
        </TouchableOpacity>

        <Text style={styles.title}>
          Return Product
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.product}>
          {orderItem.productName}
        </Text>

        {orderItem.variantName ? (
          <Text style={styles.variant}>
            {orderItem.variantName}
          </Text>
        ) : null}

      </View>

      <Text style={styles.label}>
        Return Method
      </Text>

      <TouchableOpacity
        style={[
          styles.option,
          returnType === "shop" &&
            styles.selected,
        ]}
        onPress={() => setReturnType("shop")}
      >
        <Text>
          Submit Product at Shop
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          returnType === "pickup" &&
            styles.selected,
        ]}
        onPress={() => setReturnType("pickup")}
      >
        <Text>
          Pickup From Home
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        Reason
      </Text>

      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Write reason..."
        multiline
        style={styles.input}
      />

      <TouchableOpacity
        disabled={
          mutation.isPending ||
          reason.trim().length < 3
        }
        style={styles.submit}
        onPress={() => mutation.mutate()}
      >

        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            Submit Return Request
          </Text>
        )}

      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#fff",

    padding: 18,

  },

  header: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 20,

  },

  title: {

    fontSize: 20,

    fontWeight: "700",

    marginLeft: 10,

  },

  card: {

    padding: 14,

    backgroundColor: "#f8fafc",

    borderRadius: 10,

    marginBottom: 25,

  },

  product: {

    fontSize: 17,

    fontWeight: "700",

  },

  variant: {

    color: "#64748b",

    marginTop: 4,

  },

  label: {

    fontWeight: "700",

    marginBottom: 10,

  },

  option: {

    padding: 14,

    borderWidth: 1,

    borderColor: "#d1d5db",

    borderRadius: 8,

    marginBottom: 10,

  },

  selected: {

    borderColor: "#7c3aed",

    backgroundColor: "#f3e8ff",

  },

  input: {

    borderWidth: 1,

    borderColor: "#d1d5db",

    borderRadius: 8,

    height: 120,

    padding: 10,

    textAlignVertical: "top",

    marginBottom: 25,

  },

  submit: {

    backgroundColor: "#ef4444",

    padding: 16,

    borderRadius: 8,

    alignItems: "center",

  },

  submitText: {

    color: "#fff",

    fontWeight: "700",

    fontSize: 16,

  },

});