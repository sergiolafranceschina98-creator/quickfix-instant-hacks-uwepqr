
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import Modal from '@/components/Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categoryColors: Record<string, string> = {
  cleaning: colors.cleaning,
  tech: colors.tech,
  finance: colors.finance,
  'life-hack': colors.lifeHack,
  'text-simplification': colors.textSimplification,
};

const SAVED_HACKS_KEY = '@quickfix_saved_hacks';

export default function SolutionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [saving, setSaving] = useState(false);

  const problem = params.problem as string;
  const category = params.category as string;
  const solution = params.solution as string;
  const imageUrl = params.imageUrl as string | undefined;

  console.log('[SolutionScreen] Rendered', { problem, category, imageUrl });

  const handleSave = async () => {
    console.log('[SolutionScreen] User tapped save button');
    
    if (saved || saving) return;
    
    setSaving(true);
    
    try {
      const existingHacksJson = await AsyncStorage.getItem(SAVED_HACKS_KEY);
      const existingHacks = existingHacksJson ? JSON.parse(existingHacksJson) : [];
      
      const newHack = {
        id: Date.now().toString(),
        category,
        problem,
        solution,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
      };
      
      const updatedHacks = [newHack, ...existingHacks];
      await AsyncStorage.setItem(SAVED_HACKS_KEY, JSON.stringify(updatedHacks));
      
      console.log('[SolutionScreen] Hack saved successfully', { hackId: newHack.id });
      
      setSaved(true);
      setModalType('success');
      setModalMessage('Hack saved successfully! You can view it in your profile.');
      setModalVisible(true);
    } catch (error) {
      console.error('[SolutionScreen] Failed to save hack:', error);
      setModalType('error');
      setModalMessage('Failed to save hack. Please try again.');
      setModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    console.log('[SolutionScreen] User tapped back button');
    router.back();
  };

  const categoryColor = categoryColors[category] || colors.primary;
  const saveButtonText = saved ? 'Saved!' : saving ? 'Saving...' : 'Save This Hack';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Solution',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + '20' },
            ]}
          >
            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {category}
            </Text>
          </View>
          <Text style={styles.problemTitle}>{problem}</Text>
        </View>

        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.solutionCard}>
          <View style={styles.solutionHeader}>
            <IconSymbol
              android_material_icon_name="check-circle"
              size={32}
              color={colors.success}
            />
            <Text style={styles.solutionHeaderText}>Quick Solution</Text>
          </View>
          <Text style={styles.solutionText}>{solution}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, (saved || saving) && styles.saveButtonSaved]}
            onPress={handleSave}
            disabled={saved || saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                saved
                  ? [colors.success, colors.success]
                  : [colors.gradientStart, colors.gradientEnd]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              <IconSymbol
                android_material_icon_name={saved ? 'bookmark' : 'bookmark-border'}
                size={24}
                color={colors.text}
              />
              <Text style={styles.saveButtonText}>{saveButtonText}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newProblemButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <IconSymbol
              android_material_icon_name="add"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.newProblemButtonText}>Solve Another Problem</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Pro Tips</Text>
          <View style={styles.tipItem}>
            <IconSymbol
              android_material_icon_name="info"
              size={20}
              color={colors.accent}
            />
            <Text style={styles.tipText}>
              Save this hack for quick access anytime
            </Text>
          </View>
          <View style={styles.tipItem}>
            <IconSymbol
              android_material_icon_name="info"
              size={20}
              color={colors.accent}
            />
            <Text style={styles.tipText}>
              Take a photo for visual problems for better results
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        title={modalType === 'success' ? 'Success!' : 'Error'}
        message={modalMessage}
        type={modalType}
        confirmText="OK"
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  problemTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 36,
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 250,
  },
  solutionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  solutionHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  solutionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actions: {
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveButtonSaved: {
    opacity: 0.8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  newProblemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  newProblemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
