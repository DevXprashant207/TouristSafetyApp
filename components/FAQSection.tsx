import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { useI18n } from '@/hooks/useI18n';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  visible: boolean;
  onClose: () => void;
}

export function FAQSection({ visible, onClose }: FAQSectionProps) {
  const { t } = useI18n();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: t('faqQuestion1'),
      answer: t('faqAnswer1'),
    },
    {
      id: '2',
      question: t('faqQuestion2'),
      answer: t('faqAnswer2'),
    },
    {
      id: '3',
      question: t('faqQuestion3'),
      answer: t('faqAnswer3'),
    },
    {
      id: '4',
      question: t('faqQuestion4'),
      answer: t('faqAnswer4'),
    },
    {
      id: '5',
      question: t('faqQuestion5'),
      answer: t('faqAnswer5'),
    },
  ];

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('frequentlyAskedQuestions')}</Text>
          <Button
            title=""
            onPress={onClose}
            variant="outline"
            size="small"
            style={styles.closeButton}
            icon="close"
          />
        </View>

        <ScrollView style={styles.content}>
          {faqItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.questionRow}>
                  <Text style={styles.question}>{item.question}</Text>
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#6b7280"
                  />
                </View>
                
                {isExpanded && (
                  <Text style={styles.answer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('faqFooter')}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  answer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 12,
  },
  footer: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 20,
  },
});