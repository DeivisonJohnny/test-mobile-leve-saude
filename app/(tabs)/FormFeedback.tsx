"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { ref, push, serverTimestamp } from "firebase/database";
import { auth, dbRealtime } from "../../config/firebase";
import { Card } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { AirbnbRating, Rating } from "react-native-ratings";

export default function FormFeedback() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function extractNameFromEmail(email: string): string {
    const [user] = email.split("@");

    const onlyLetters = user.replace(/[^a-zA-Z]/g, "");

    const wordsFinal = onlyLetters.match(/[A-Z]?[a-z]+/g) ||
      onlyLetters.match(/[a-z]{2,}/gi) || [onlyLetters];
    const nameFinal = wordsFinal
      .map(
        (palavra) =>
          palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
      )
      .join(" ");

    return nameFinal.trim();
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("⚠️ Atenção", "Por favor, selecione uma nota para continuar");
      return;
    }

    if (comment.length < 10) {
      Alert.alert(
        "⚠️ Atenção",
        "O comentário deve ter no mínimo 10 caracteres"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackRef = ref(dbRealtime, "feedbacks");
      await push(feedbackRef, {
        userId: auth.currentUser?.uid,
        userName:
          auth.currentUser?.displayName ||
          extractNameFromEmail(auth.currentUser?.email as string),
        rating,
        comment,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        "✅ Sucesso!",
        "Seu feedback foi enviado com sucesso. Obrigado pela sua opinião!",
        [{ text: "OK", style: "default" }]
      );

      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Erro ao enviar feedback: ", error);
      Alert.alert(
        "❌ Erro",
        "Não foi possível enviar o feedback. Tente novamente.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: "Muito Ruim",
      2: "Ruim",
      3: "Regular",
      4: "Bom",
      5: "Excelente",
    };
    return texts[rating as keyof typeof texts] || "";
  };

  const getRatingColor = (rating: number) => {
    const colors = {
      1: "#EF4444",
      2: "#F97316",
      3: "#EAB308",
      4: "#22C55E",
      5: "#10B981",
    };
    return colors[rating as keyof typeof colors] || "#6B7280";
  };

  const getRatingEmoji = (rating: number) => {
    const emojis = { 1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😍" };
    return emojis[rating as keyof typeof emojis] || "";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Card containerStyle={styles.card}>
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={32}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.title}>Como foi sua experiência?</Text>
              <Text style={styles.subtitle}>
                Sua opinião é muito importante para nós
              </Text>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Avaliação</Text>
              <AirbnbRating
                count={5}
                reviews={["Muito Ruim", "Ruim", "Regular", "Bom", "Excelente"]}
                defaultRating={rating}
                size={32}
                onFinishRating={setRating}
                showRating={false}
                selectedColor="#FBBF24"
              />

              <Rating onFinishRating={setRating} />

              {rating > 0 && (
                <View
                  style={[
                    styles.ratingFeedback,
                    { backgroundColor: `${getRatingColor(rating)}20` },
                  ]}
                >
                  <Text style={[styles.ratingEmoji]}>
                    {getRatingEmoji(rating)}
                  </Text>
                  <Text
                    style={[
                      styles.ratingText,
                      { color: getRatingColor(rating) },
                    ]}
                  >
                    {getRatingText(rating)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Comentário</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    comment.length >= 10 && styles.inputValid,
                    comment.length > 0 &&
                      comment.length < 10 &&
                      styles.inputInvalid,
                  ]}
                  placeholder="Conte-nos mais sobre sua experiência... (mínimo 10 caracteres)"
                  placeholderTextColor="#9CA3AF"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />

                <Text
                  style={[
                    styles.charCounter,
                    comment.length >= 10 && styles.charCounterValid,
                    comment.length > 0 &&
                      comment.length < 10 &&
                      styles.charCounterInvalid,
                  ]}
                >
                  {comment.length}/500
                </Text>

                {comment.length > 0 && comment.length < 10 && (
                  <Text style={styles.validationMessage}>
                    Mínimo de 10 caracteres necessários
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || comment.length < 10 || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || comment.length < 10 || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Enviando...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Enviar Feedback</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#fff",
    borderWidth: 0,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  ratingSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  ratingFeedback: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  ratingEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  commentSection: {
    marginBottom: 24,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 120,
    backgroundColor: "#F9FAFB",
    color: "#374151",
    lineHeight: 24,
  },
  inputValid: {
    borderColor: "#10B981",
  },
  inputInvalid: {
    borderColor: "#EF4444",
  },
  charCounter: {
    position: "absolute",
    bottom: 12,
    right: 12,
    fontSize: 12,
    color: "#9CA3AF",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  charCounterValid: {
    color: "#10B981",
  },
  charCounterInvalid: {
    color: "#EF4444",
  },
  validationMessage: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    backgroundColor: "#3B82F6",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
