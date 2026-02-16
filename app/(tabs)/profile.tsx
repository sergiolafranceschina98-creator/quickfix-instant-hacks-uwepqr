
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';
import { authenticatedGet, authenticatedDelete } from '@/utils/api';

interface SavedHack {
  id: string;
  category: string;
  problem: string;
  solution: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  cleaning: colors.cleaning,
  tech: colors.tech,
  finance: colors.finance,
  'life-hack': colors.lifeHack,
  'text-simplification': colors.textSimplification,
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [savedHacks, setSavedHacks] = useState<SavedHack[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [hackToDelete, setHackToDelete] = useState<string | null>(null);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  console.log('ProfileScreen rendered');

  useEffect(() => {
    loadSavedHacks();
  }, []);

  const loadSavedHacks = async () => {
    console.log('[ProfileScreen] Loading saved hacks');
    setLoading(true);

    try {
      const hacks = await authenticatedGet<SavedHack[]>('/api/saved-hacks');
      console.log('[ProfileScreen] Saved hacks loaded:', hacks);
      setSavedHacks(hacks);
    } catch (error) {
      console.error('[ProfileScreen] Error loading saved hacks:', error);
      setSavedHacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHack = async (hackId: string) => {
    console.log('[ProfileScreen] User tapped delete for hack:', hackId);
    setHackToDelete(hackId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!hackToDelete) return;

    console.log('[ProfileScreen] Deleting hack:', hackToDelete);
    
    try {
      await authenticatedDelete(`/api/saved-hacks/${hackToDelete}`);
      console.log('[ProfileScreen] Hack deleted successfully');
      setSavedHacks((prev) => prev.filter((hack) => hack.id !== hackToDelete));
    } catch (error) {
      console.error('[ProfileScreen] Error deleting hack:', error);
    } finally {
      setHackToDelete(null);
    }
  };

  const handleSignOut = () => {
    setSignOutModalVisible(true);
  };

  const confirmSignOut = async () => {
    console.log('[ProfileScreen] User signing out');
    await signOut();
  };

  const categoryColor = (category: string) => {
    return categoryColors[category] || colors.primary;
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Saved Hacks</Text>
                <Text style={styles.headerSubtitle}>
                  Your favorite solutions for quick access
                </Text>
              </View>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <IconSymbol
                  android_material_icon_name="logout"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading your saved hacks...</Text>
            </View>
          ) : savedHacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <IconSymbol
                  android_material_icon_name="bookmark-border"
                  size={64}
                  color={colors.textTertiary}
                />
              </View>
              <Text style={styles.emptyTitle}>No saved hacks yet</Text>
              <Text style={styles.emptySubtitle}>
                Save your favorite solutions for quick access anytime
              </Text>
            </View>
          ) : (
            <View style={styles.hacksContainer}>
              {savedHacks.map((hack, index) => {
                const color = categoryColor(hack.category);
                const dateText = new Date(hack.createdAt).toLocaleDateString();
                
                return (
                  <View key={index} style={styles.hackCard}>
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
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <IconSymbol
                          android_material_icon_name="delete"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.hackProblem}>{hack.problem}</Text>
                    <Text style={styles.hackSolution} numberOfLines={3}>
                      {hack.solution}
                    </Text>
                    <Text style={styles.hackDate}>{dateText}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedHacks.length}</Text>
                <Text style={styles.statLabel}>Saved Hacks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedHacks.length}</Text>
                <Text style={styles.statLabel}>Problems Solved</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        title="Delete Hack?"
        message="Are you sure you want to delete this saved hack? This action cannot be undone."
        type="warning"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setHackToDelete(null)}
        onClose={() => setDeleteModalVisible(false)}
      />

      <Modal
        visible={signOutModalVisible}
        title="Sign Out?"
        message="Are you sure you want to sign out?"
        type="info"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onClose={() => setSignOutModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  gradientHeader: {
    padding: 32,
    paddingTop: Platform.OS === 'android' ? 48 : 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.9,
  },
  signOutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  hacksContainer: {
    marginBottom: 32,
  },
  hackCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
  hackProblem: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  hackSolution: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  hackDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statsSection: {
    marginTop: 16,
  },
  statsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
