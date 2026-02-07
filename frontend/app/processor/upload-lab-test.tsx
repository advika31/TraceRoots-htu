import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AiAPI, ProcessorAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_API_URL; 

export default function UploadLabTest() {
  const router = useRouter();
  const { batchId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [batchData, setBatchData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [reportImage, setReportImage] = useState<string | null>(null);

  useEffect(() => {
    loadBatchDetails();
  }, []);

  const loadBatchDetails = async () => {
    try {
      const data = await ProcessorAPI.getBatch(batchId as string);
      setBatchData(data);
    } catch (e) {
      Alert.alert("Error", "Could not fetch batch details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await AiAPI.analyzeBatch(batchId as string);
      setAnalysis(result);
      setNotes(result.processor_notes); 
    } catch (e) {
      Alert.alert("Error", "AI Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const pickReportImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setReportImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!analysis) {
      Alert.alert("Wait", "Please run AI Grading first.");
      return;
    }

    setLoading(true);
    try {
      // 1. Save Grading Data (Scores, Notes, Status)
      const gradingPayload = {
        ...analysis,
        processor_notes: notes
      };
      await ProcessorAPI.saveGrading(batchId as string, gradingPayload);

      // 2. Upload Official Report (If selected)
      if (reportImage) {
        const formData = new FormData();
        const filename = reportImage.split('/').pop() || "report.jpg";
        formData.append('result_summary', `Graded ${analysis.quality_grade} - ${notes}`);
        formData.append('processor_id', '101'); // Mock ID
        // @ts-ignore
        formData.append('file', { uri: reportImage, name: filename, type: 'image/jpeg' });
        
        await ProcessorAPI.uploadReport(batchId as string, formData);
      }
      
      Alert.alert("Certified!", "Batch grading and report saved successfully.", [
        { text: "Done", onPress: () => router.replace('/processor/processor_dashboard') }
      ]);

    } catch (e) {
      Alert.alert("Error", "Could not save data.");
    } finally {
      setLoading(false);
    }
  };

  if (!batchData) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32"/></View>;

  const farmerImage = batchData.images && batchData.images.length > 0 
    ? `${API_BASE}${batchData.images[0].image_url}` 
    : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Quality Control 🔬</Text>
      <Text style={styles.subHeader}>Batch #{String(batchId).substring(0, 8)} • {batchData.crop_name}</Text>

      {/* 1. Farmer's Image Display */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionLabel}>Farmer's Upload</Text>
        {farmerImage ? (
          <Image source={{ uri: farmerImage }} style={styles.cropImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cropImage, styles.placeholder]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
            <Text style={{color:'#999'}}>No image available</Text>
          </View>
        )}
      </View>

      {/* 2. AI Grading Action */}
      {!analysis ? (
        <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" style={{marginRight:8}}/>
              <Text style={styles.btnText}>Analyze with AI</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.resultBox}>
          <View style={styles.gradeRow}>
            <Text style={styles.gradeTitle}>Grade: {analysis.quality_grade}</Text>
            <Text style={styles.freshness}>Freshness: {analysis.freshness_score}%</Text>
          </View>
          <Text style={styles.aiDetails}>Shelf Life: {analysis.estimated_shelf_life} days</Text>
          <Text style={styles.aiDetails}>Defects: {analysis.visual_defects}</Text>
        </View>
      )}

      {/* 3. Processor Notes */}
      {analysis && (
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Processor Remarks</Text>
          <TextInput 
            style={styles.input} 
            multiline 
            numberOfLines={3} 
            value={notes} 
            onChangeText={setNotes}
            placeholder="Add specific observations..." 
          />

          <Text style={styles.sectionLabel}>Official Lab Report (Optional)</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickReportImage}>
            <Ionicons name={reportImage ? "document-attach" : "cloud-upload-outline"} size={24} color="#555" />
            <Text style={styles.uploadText}>
              {reportImage ? "Report Attached" : "Upload Certificate / PDF"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Submit Certification</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20', marginTop: 20 },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 15 },
  
  imageSection: { alignItems: 'center', marginBottom: 20 },
  cropImage: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#f0f0f0' },
  placeholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },

  analyzeBtn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  resultBox: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10, marginTop: 10, borderLeftWidth: 5, borderLeftColor: '#2e7d32' },
  gradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  gradeTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20' },
  freshness: { fontSize: 16, fontWeight: '600', color: '#333' },
  aiDetails: { color: '#555', marginBottom: 2 },

  formSection: { marginTop: 10 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, textAlignVertical: 'top', fontSize: 14 },
  
  uploadBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 20 },
  uploadText: { marginLeft: 10, color: '#555', fontWeight: '500' },

  submitBtn: { backgroundColor: '#1565c0', padding: 15, borderRadius: 10, alignItems: 'center' }
});