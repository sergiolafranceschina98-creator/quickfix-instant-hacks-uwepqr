
import { StyleSheet } from 'react-native';

// QuickFix Premium Color Palette - Sophisticated Dark Theme with Vibrant Orange Accents
export const colors = {
  // Dark theme base
  background: '#0A0A0F',
  backgroundSecondary: '#13131A',
  card: '#1A1A24',
  cardElevated: '#22222E',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#6B6B7B',
  
  // Orange accents
  primary: '#FF6B35',
  primaryLight: '#FF8555',
  primaryDark: '#E55525',
  
  // Secondary colors
  secondary: '#4A90E2',
  accent: '#FFB84D',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  
  // UI elements
  border: '#2A2A35',
  borderLight: '#3A3A45',
  highlight: '#FF6B3520',
  
  // Gradients
  gradientStart: '#FF6B35',
  gradientEnd: '#FFB84D',
  
  // Category colors
  cleaning: '#4ECDC4',
  tech: '#5B7FFF',
  finance: '#50C878',
  lifeHack: '#FF6B9D',
  textSimplification: '#FFB84D',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
