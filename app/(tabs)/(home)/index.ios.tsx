
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'sparkles',
    color: colors.cleaning,
    description: 'Stains, spills, and messes',
  },
  {
    id: 'tech',
    name: 'Tech',
    icon: 'gearshape.fill',
    color: colors.tech,
    description: 'Wi-Fi, devices, and apps',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'dollarsign.circle.fill',
    color: colors.finance,
    description: 'Tips, bills, and calculations',
  },
  {
    id: 'life-hack',
    name: 'Life Hack',
    icon: 'lightbulb.fill',
    color: colors.lifeHack,
    description: 'Quick fixes and shortcuts',
  },
  {
    id: 'text-simplification',
    name: 'Simplify Text',
    icon: 'doc.text.fill',
    color: colors.textSimplification,
    description: 'Contracts and instructions',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('HomeScreen rendered (iOS)');

  const handleCategorySelect = (categoryId: string) => {
    console.log('User selected category:', categoryId);
    setSelectedCategory(categoryId);
  };

  const handleSolve = async () => {
    if (!problem.trim() || !selectedCategory) {
      console.log('Cannot solve: missing problem or category');
      return;
    }

    console.log('User tapped Solve button', { problem, category: selectedCategory });
    setLoading(true);

    try {
      const { apiPost } = await import('@/utils/api');
      const response = await apiPost<{ solution: string; category: string }>('/api/solve', {
        problem: problem.trim(),
        category: selectedCategory,
      });

      console.log('[HomeScreen] Solution received:', response);
      
      router.push({
        pathname: '/solution',
        params: {
          problem: problem.trim(),
          category: selectedCategory,
          solution: response.solution,
        },
      });
    } catch (error) {
      console.error('[HomeScreen] Error getting solution:', error);
      router.push({
        pathname: '/solution',
        params: {
          problem: problem.trim(),
          category: selectedCategory,
          solution: 'Sorry, we encountered an error generating your solution. Please try again.',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSolve = async () => {
    console.log('User tapped camera button');
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      console.log('Camera permission denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('Image captured, uploading for analysis');
      setLoading(true);

      try {
        const { BACKEND_URL } = await import('@/utils/api');
        const asset = result.assets[0];
        
        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);
        
        formData.append('problem', problem.trim() || 'Analyze this image and provide a solution');

        const uploadResponse = await fetch(`${BACKEND_URL}/api/solve/image`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();
        console.log('[HomeScreen] Image solution received:', data);

        router.push({
          pathname: '/solution',
          params: {
            problem: problem.trim() || 'Image-based problem',
            category: 'image-analysis',
            solution: data.solution,
            imageUrl: data.imageUrl,
          },
        });
      } catch (error) {
        console.error('[HomeScreen] Error analyzing image:', error);
        router.push({
          pathname: '/solution',
          params: {
            problem: 'Image analysis',
            category: 'image-analysis',
            solution: 'Sorry, we encountered an error analyzing your image. Please try again.',
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const categoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name || 'Category'
    : 'Select Category';

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
            <Text style={styles.headerTitle}>QuickFix</Text>
            <Text style={styles.headerSubtitle}>Instant Life Hacks</Text>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>What&apos;s your problem?</Text>
          <Text style={styles.sectionSubtitle}>
            Select a category and describe your issue
          </Text>

          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category.color + '20' },
                    ]}
                  >
                    <IconSymbol
                      ios_icon_name={category.icon}
                      android_material_icon_name="home"
                      size={28}
                      color={category.color}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Describe your problem</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Red wine spilled on carpet"
              placeholderTextColor={colors.textTertiary}
              value={problem}
              onChangeText={setProblem}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.solveButton,
                (!problem.trim() || !selectedCategory || loading) &&
                  styles.solveButtonDisabled,
              ]}
              onPress={handleSolve}
              disabled={!problem.trim() || !selectedCategory || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !problem.trim() || !selectedCategory || loading
                    ? [colors.textTertiary, colors.textTertiary]
                    : [colors.gradientStart, colors.gradientEnd]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.solveButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <React.Fragment>
                    <IconSymbol
                      ios_icon_name="bolt.fill"
                      android_material_icon_name="flash-on"
                      size={24}
                      color={colors.text}
                    />
                    <Text style={styles.solveButtonText}>Get Instant Solution</Text>
                  </React.Fragment>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleImageSolve}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="camera-alt"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.cameraButtonText}>Solve with Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10s</Text>
              <Text style={styles.statLabel}>Avg. Solution Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1M+</Text>
              <Text style={styles.statLabel}>Problems Solved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: '1%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  actionButtons: {
    marginBottom: 32,
  },
  solveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  solveButtonDisabled: {
    opacity: 0.5,
  },
  solveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  solveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cameraButton: {
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
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
