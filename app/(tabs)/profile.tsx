import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Button } from '@/components/Button';
import { ProfileCard } from '@/components/ProfileCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { FAQSection } from '@/components/FAQSection';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { blockchainId, issueToBlockchain, isIssuing } = useBlockchain();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const handleIssueToBlockchain = async () => {
    Alert.alert(
      t('issueToBlockchain'),
      t('blockchainIssueConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('issue'),
          onPress: async () => {
            try {
              const txHash = await issueToBlockchain();
              Alert.alert(
                t('success'),
                t('blockchainIssueSuccess') + `\n\n${t('transactionHash')}: ${txHash}`,
                [
                  {
                    text: t('viewOnExplorer'),
                    onPress: () => {
                      // In production, this would link to the actual blockchain explorer
                      Linking.openURL(`https://polygonscan.com/tx/${txHash}`);
                    },
                  },
                  { text: t('ok'), style: 'default' },
                ]
              );
            } catch (error) {
              Alert.alert(t('error'), t('blockchainIssueFailed'));
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('signOut'), style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile')}</Text>
          <Text style={styles.subtitle}>{t('manageAccountSettings')}</Text>
        </View>

        {/* Profile Information */}
        <ProfileCard user={user!} />

        {/* Blockchain ID Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('blockchainId')}</Text>
          <View style={styles.blockchainCard}>
            <View style={styles.blockchainHeader}>
              <MaterialIcons name="security" size={24} color="#3b82f6" />
              <Text style={styles.blockchainTitle}>{t('digitalIdentity')}</Text>
            </View>
            
            {blockchainId ? (
              <View style={styles.blockchainIdContainer}>
                <Text style={styles.blockchainIdLabel}>{t('yourBlockchainId')}:</Text>
                <Text style={styles.blockchainIdValue}>{blockchainId}</Text>
                <View style={styles.blockchainActions}>
                  <Button
                    title={isIssuing ? t('issuing') : t('issueToBlockchain')}
                    onPress={handleIssueToBlockchain}
                    disabled={isIssuing}
                    style={styles.blockchainButton}
                    icon="send"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.noBlockchainId}>
                <Text style={styles.noBlockchainIdText}>
                  {t('generatingBlockchainId')}
                </Text>
              </View>
            )}

            <Text style={styles.blockchainDescription}>
              {t('blockchainIdDescription')}
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          
          {/* Language Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="language" size={24} color="#6b7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('language')}</Text>
                <Text style={styles.settingDescription}>
                  {currentLanguage === 'en' ? 'English' : 'Español'}
                </Text>
              </View>
            </View>
            <Button
              title={t('change')}
              onPress={() => setShowLanguageSelector(true)}
              style={styles.settingButton}
              textStyle={styles.settingButtonText}
            />
          </View>

          {/* FAQ Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="help-outline" size={24} color="#6b7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('faq')}</Text>
                <Text style={styles.settingDescription}>
                  {t('frequentlyAskedQuestions')}
                </Text>
              </View>
            </View>
            <Button
              title={t('view')}
              onPress={() => setShowFAQ(true)}
              style={styles.settingButton}
              textStyle={styles.settingButtonText}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Button
            title={t('signOut')}
            onPress={handleSignOut}
            style={styles.signOutButton}
            textStyle={styles.signOutButtonText}
            icon="logout"
          />
        </View>
      </ScrollView>

      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={changeLanguage}
      />

      <FAQSection
        visible={showFAQ}
        onClose={() => setShowFAQ(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    paddingBottom: 8,
  },
  blockchainCard: {
    padding: 16,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  blockchainIdContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  blockchainIdLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  blockchainIdValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#111827',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  blockchainActions: {
    alignItems: 'flex-start',
  },
  blockchainButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  noBlockchainId: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  noBlockchainIdText: {
    color: '#6b7280',
    fontSize: 14,
  },
  blockchainDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  settingButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});