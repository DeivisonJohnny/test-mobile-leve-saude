"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from "react-native";
import { ref, query, orderByChild, equalTo, onValue } from "firebase/database";
import { AirbnbRating, Card, Avatar } from "@rneui/themed";
import { auth, dbRealtime } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  userName: string;
}

interface FeedbackStats {
  total: number;
  average: number;
  distribution: { [key: number]: number };
}

export default function ListFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    average: 0,
    distribution: {},
  });

  const calculateStats = (feedbackList: Feedback[]) => {
    if (feedbackList.length === 0) {
      return { total: 0, average: 0, distribution: {} };
    }

    const total = feedbackList.length;
    const sum = feedbackList.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    const average = sum / total;

    const distribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = feedbackList.filter((f) => f.rating === i).length;
    }

    return { total, average, distribution };
  };

  const loadFeedbacks = () => {
    const user = auth.currentUser;
    if (user) {
      const feedbackRef = ref(dbRealtime, "feedbacks");
      const q = query(feedbackRef, orderByChild("userId"), equalTo(user.uid));

      const unsubscribe = onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const feedbackList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          feedbackList.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setFeedbacks(feedbackList);
          setStats(calculateStats(feedbackList));
        } else {
          setFeedbacks([]);
          setStats({ total: 0, average: 0, distribution: {} });
        }
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } else {
      setFeedbacks([]);
      setStats({ total: 0, average: 0, distribution: {} });
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = loadFeedbacks();
    return () => unsubscribe && unsubscribe();
  }, [auth.currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeedbacks();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
    return emojis[rating as keyof typeof emojis] || "⭐";
  };

  const renderStatsCard = () => (
    <Card containerStyle={styles.statsCard}>
      <View style={styles.statsHeader}>
        <View style={styles.statsIconContainer}>
          <Ionicons name="analytics" size={24} color="#3B82F6" />
        </View>
        <Text style={styles.statsTitle}>Estatísticas dos Feedbacks</Text>
      </View>

      <View style={styles.statsContent}>
        <View style={styles.statItem}>
          <View style={styles.statNumberContainer}>
            <Text style={styles.statNumber}>{stats.total}</Text>
          </View>
          <Text style={styles.statLabel}>Total de Avaliações</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statNumberContainer}>
            <Text style={styles.statNumber}>{stats.average.toFixed(1)}</Text>
            <Text style={styles.statEmoji}>
              {getRatingEmoji(Math.round(stats.average))}
            </Text>
          </View>
          <Text style={styles.statLabel}>Média Geral</Text>
          <AirbnbRating
            count={5}
            defaultRating={Math.round(stats.average)}
            size={14}
            isDisabled
            showRating={false}
            selectedColor="#FBBF24"
          />
        </View>
      </View>
    </Card>
  );

  const renderItem = ({ item }: { item: Feedback; index: number }) => (
    <Card containerStyle={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View style={styles.ratingSection}>
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(item.rating) },
            ]}
          >
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.ratingEmoji}>
              {getRatingEmoji(item.rating)}
            </Text>
          </View>
          <AirbnbRating
            count={5}
            defaultRating={item.rating}
            size={16}
            isDisabled
            showRating={false}
            selectedColor="#FBBF24"
          />
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>

      <View style={styles.feedbackFooter}>
        <View style={styles.userInfo}>
          <Avatar
            size={28}
            rounded
            title={item.userName.charAt(0).toUpperCase()}
            containerStyle={styles.avatarContainer}
          />
          <Text style={styles.userName}>{item.userName}</Text>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>Nenhum feedback encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Seus feedbacks aparecerão aqui quando você enviá-los
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <View style={styles.loadingIconContainer}>
        <Ionicons name="hourglass-outline" size={40} color="#3B82F6" />
      </View>
      <Text style={styles.loadingText}>Carregando feedbacks...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.content}>
        {loading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={feedbacks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={feedbacks.length > 0 ? renderStatsCard : null}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={["#3B82F6"]}
              />
            }
          />
        )}
      </View>
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
    justifyContent: "space-between",
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
  headerActions: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 30,
  },
  statsCard: {
    borderRadius: 16,
    marginVertical: 20,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  statNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B82F6",
    marginRight: 4,
  },
  statEmoji: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  feedbackCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  ratingText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },
  ratingEmoji: {
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  commentSection: {
    marginBottom: 16,
  },
  commentText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  feedbackFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    backgroundColor: "#3B82F6",
  },
  userName: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
});
