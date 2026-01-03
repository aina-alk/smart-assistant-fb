/**
 * Consultation Components - Barrel exports
 */

// Audio & Recording
export { AudioRecorder } from './audio-recorder';
export { AudioControls } from './audio-controls';

// Transcription
export { TranscriptionDisplay } from './transcription-display';
export { TranscriptionProgress } from './transcription-progress';
export { DictationPanel } from './dictation-panel';

// CRC & Diagnostics
export { CRCEditor, CRCPreview } from './crc-editor';
export { CRCSection } from './crc-section';
export { CRCExamenSection } from './crc-examen-section';
export { CRCPreviewDocument, CRCPreviewDialog, CRCPreviewCompact } from './crc-preview';
export { DiagnosticSelector } from './diagnostic-selector';

// Codage
export { CodagePanel } from './codage-panel';

// Workflow
export { StepIndicator, StepIndicatorCompact } from './step-indicator';
export { PatientSelector, PatientBadge } from './patient-selector';
export { ConsultationWorkflow } from './consultation-workflow';

// Detail View (bloc 4.4)
export { ConsultationHeader } from './consultation-header';
export { ConsultationView } from './consultation-view';
export { ConsultationDocuments } from './consultation-documents';
