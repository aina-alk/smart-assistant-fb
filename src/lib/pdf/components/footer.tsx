/**
 * PDF Footer Component
 * Pied de page avec numéro de page et informations optionnelles
 */

import { View, Text } from '@react-pdf/renderer';
import { footerStyles } from '../styles';

// ============================================================================
// Types
// ============================================================================

export interface PDFFooterProps {
  text?: string;
  showPageNumber?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function PDFFooter({ text, showPageNumber = true }: PDFFooterProps) {
  return (
    <View style={footerStyles.container} fixed>
      {text && <Text style={footerStyles.text}>{text}</Text>}
      {showPageNumber && (
        <Text
          style={footerStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
        />
      )}
    </View>
  );
}
