
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from '@/components/Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedHack {
  id: string;
  category: string;
  problem: string;
  solution: string;
  imageUrl?: string | null;
  createdAt: string;
}

const SAVED_HACKS_KEY = '@quickfix_saved_hacks';

export default function ProfileScreen() {
  const [savedHacks, setSavedHacks] = useState<SavedHack[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [hackToDelete, setHackToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSavedHacks();
  }, []);

  const loadSavedHacks = async () => {
    console.log('[ProfileScreen] Loading saved hacks from AsyncStorage');
    try {
      const hacksJson = await AsyncStorage.getItem(SAVED_HACKS_KEY);
      const hacks = hacksJson ? JSON.parse(hacksJson) : [];
      console.log('[ProfileScreen] Loaded hacks:', hacks.length);
      setSavedHacks(hacks);
    } catch (error) {
      console.error('[ProfileScreen] Failed to load saved hacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHack = (hackId: string) => {
    console.log('[ProfileScreen] User tapped delete for hack:', hackId);
    setHackToDelete(hackId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!hackToDelete) return;
    
    console.log('[ProfileScreen] Confirming delete for hack:', hackToDelete);
    
    try {
      const updatedHacks = savedHacks.filter(hack => hack.id !== hackToDelete);
      await AsyncStorage.setItem(SAVED_HACKS_KEY, JSON.stringify(updatedHacks));
      setSavedHacks(updatedHacks);
      console.log('[ProfileScreen] Hack deleted successfully');
    } catch (error) {
      console.error('[ProfileScreen] Failed to delete hack:', error);
    } finally {
      setDeleteModalVisible(false);
      setHackToDelete(null);
    }
  };

  const categoryColor = (category: string) => {
    const colors_map: Record<string, string> = {
      cleaning: colors.cleaning,
      tech: colors.tech,
      finance: colors.finance,
      'life-hack': colors.lifeHack,
      'text-simplification': colors.textSimplification,
    };
    return colors_map[category] || colors.primary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      const daysText = `${diffDays} days ago`;
      return daysText;
    }
    
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
    return formattedDate;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your saved hacks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Hacks</Text>
        <Text style={styles.headerSubtitle}>
          {savedHacks.length === 0 ? 'No saved hacks yet' : `${savedHacks.length} saved ${savedHacks.length === 1 ? 'hack' : 'hacks'}`}
        </Text>
      </View>

      {savedHacks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            android_material_icon_name="bookmark-border"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No Saved Hacks Yet</Text>
          <Text style={styles.emptyText}>
            When you save a hack, it will appear here for quick access
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {savedHacks.map((hack) => {
            const color = categoryColor(hack.category);
            const dateText = formatDate(hack.createdAt);
            
            return (
              <View key={hack.id} style={styles.hackCard}>
                <LinearGradient
                  colors={[colors.card, colors.card]}
                  style={styles.hackCardGradient}
                >
                  <View style={styles.hackHeader}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: color + '20' },
                      ]}
                    >
                      <Text style={[styles.categoryBadgeText, { color }]}>
                        {hack.category}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteHack(hack.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <IconSymbol
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.hackProblem}>{hack.problem}</Text>

                  {hack.imageUrl && (
                    <View style={styles.hackImageContainer}>
                      <Image
                        source={{ uri: hack.imageUrl }}
                        style={styles.hackImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <Text style={styles.hackSolution} numberOfLines={3}>
                    {hack.solution}
                  </Text>

                  <View style={styles.hackFooter}>
                    <View style={styles.dateContainer}>
                      <IconSymbol
                        android_material_icon_name="schedule"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.dateText}>{dateText}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={deleteModalVisible}
        title="Delete Hack?"
        message="Are you sure you want to delete this saved hack? This action cannot be undone."
        type="warning"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setHackToDelete(null);
        }}
        onClose={() => {
          setDeleteModalVisible(false);
          setHackToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  hackCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hackCardGradient: {
    padding: 20,
  },
  hackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.error + '20',
  },
  hackProblem: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  hackImageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hackImage: {
    width: '100%',
    height: 150,
  },
  hackSolution: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  hackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
