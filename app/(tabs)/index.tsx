import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Modal,
  ImageBackground,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

type StressData = number[];

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <View style={styles.startContainer}>
      <View style={styles.startContent}>
        <Text style={styles.startTitle}>Welcome to CalmPulse</Text>
        <Text style={styles.startSubtitle}>Your Personal Stress Management Assistant</Text>
        
        <View style={styles.iconContainer}>
          <FontAwesome6 name="heart-pulse" size={80} color="#4caf50" style={styles.startIcon} />
        </View>
        
        <Text style={styles.startDescription}>
          Monitor your stress levels, heart rate variability, and body temperature in real-time.
          Get personalized recommendations for better health management.
        </Text>
        
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start Monitoring</Text>
          <FontAwesome6 name="arrow-right" size={20} color="#fff" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [stressData, setStressData] = useState<StressData>([]);
  const [stressLevel, setStressLevel] = useState<string>("Normal");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentStress, setCurrentStress] = useState<number>(0);
  const [bodyTemperature, setBodyTemperature] = useState<number>(36.5);
  const [hrvValue, setHrvValue] = useState<number>(50);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [tempAnimation] = useState(new Animated.Value(36.5));
  const [hrvAnimation] = useState(new Animated.Value(50));
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Simulated data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const newStressValue = Math.floor(Math.random() * 100);
      const newTempValue = 36 + Math.random() * 1.5;
      const newHrvValue = 20 + Math.floor(Math.random() * 180);

      setCurrentStress(newStressValue);
      setBodyTemperature(newTempValue);
      setHrvValue(newHrvValue);
      setStressData((prevData) => [...prevData.slice(-9), newStressValue]);

      // Animate the progress
      Animated.parallel([
        Animated.timing(progressAnimation, {
          toValue: newStressValue,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(tempAnimation, {
          toValue: newTempValue,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(hrvAnimation, {
          toValue: newHrvValue,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();

      // Classify stress levels
      if (newStressValue > 70) setStressLevel("High");
      else if (newStressValue > 40) setStressLevel("Moderate");
      else setStressLevel("Normal");
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const connectToDevice = () => {
    setIsConnected(true);
    console.log("Connected to Device");
  };

  const openRelaxationHub = () => {
    console.log("Navigate to Relaxation Hub");
    // Add navigation logic here
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case "High":
        return "#ff5252";
      case "Moderate":
        return "#ffa726";
      default:
        return "#4caf50";
    }
  };

  const getTempColor = (temp: number) => {
    if (temp > 37.5) return "#ff5252";      // Red for high temperature
    if (temp < 36.0) return "#2196f3";      // Blue for low temperature
    if (temp >= 36.0 && temp <= 37.5) {     // Green to Yellow gradient for normal range
      const normalizedTemp = (temp - 36.0) / (37.5 - 36.0);  // 0 to 1
      if (normalizedTemp <= 0.5) {
        return "#4caf50";  // Green for lower normal
      } else {
        return "#ffa726";  // Orange for higher normal
      }
    }
    return "#4caf50";  // Default green
  };

  const getHrvColor = (hrv: number) => {
    if (hrv < 30) return "#ff5252";
    if (hrv > 150) return "#2196f3";
    return "#4caf50";
  };

  const getHrvPercentage = (hrv: number) => {
    return Math.min(100, Math.max(0, ((hrv - 20) / (200 - 20)) * 100));
  };

  const getStressExercises = (stressLevel: number) => {
    if (stressLevel >= 100) {
      return "• Sprinting (10–30 seconds)\n• Clap Push-Ups\n• Hill Sprints";
    } else if (stressLevel >= 90) {
      return "• Deadlifts (90% of 1-rep max)\n• Squats (90% 1RM)\n• Dumbbell Snatch";
    } else if (stressLevel >= 80) {
      return "• Running (400m repeats)\n• Push-Ups (fast tempo)\n• Cycling Sprints (30s on/30s off)";
    } else if (stressLevel >= 70) {
      return "• Jogging (5K pace)\n• Bodyweight Squats (15–20 reps)\n• Moderate Cycling (hill climbs)";
    } else if (stressLevel >= 60) {
      return "• Brisk Walking (power walk)\n• Swimming (leisurely laps)\n• Yoga Flow (vinyasa)";
    } else if (stressLevel >= 50) {
      return "• Walking (casual pace)\n• Wall Push-Ups\n• Standing Hip Circles";
    } else if (stressLevel >= 40) {
      return "• Leisurely Walking (park stroll)\n• Slow Yoga (yin or restorative)\n• Deep Breathing Drills";
    } else if (stressLevel >= 30) {
      return "• Chair Yoga\n• Static Stretching (hamstrings, quads)\n• Body Scans (mindfulness + stretching)";
    } else if (stressLevel >= 20) {
      return "• Slow Walking (indoor pacing)\n• Mindful Breathing (diaphragmatic breaths)\n• Gentle Eye Exercises";
    } else {
      return "• Deep Breathing (4-7-8 technique)\n• Meditation (guided or silent)\n• Progressive Muscle Relaxation";
    }
  };

  const getTemperatureExercises = (temp: number) => {
    if (temp >= 38.0) {
      return "• Rest in a cool environment\n• Take lukewarm (not cold) bath\n• Use light clothing\n• Stay hydrated with cool water";
    } else if (temp >= 37.5) {
      return "• Light stretching exercises\n• Gentle walking in cool area\n• Deep breathing exercises\n• Stay in ventilated space";
    } else if (temp >= 37.0) {
      return "• Moderate walking\n• Light yoga\n• Tai chi\n• Swimming in temperature-controlled pool";
    } else if (temp >= 36.5) {
      return "• Regular cardio exercises\n• Jogging\n• Cycling\n• Regular workout routine";
    } else if (temp >= 36.0) {
      return "• Brisk walking\n• Dynamic stretching\n• Light aerobics\n• Regular activities";
    } else if (temp >= 35.5) {
      return "• Indoor exercises\n• Warm-up routines\n• Light cardio with proper clothing\n• Gradual intensity increase";
    } else {
      return "• Indoor warm-up exercises\n• Movement in warm environment\n• Gentle stretching with warm clothing\n• Hot yoga (if available)";
    }
  };

  const getAnalysisText = (metric: string) => {
    switch (metric) {
      case 'stress':
        return {
          title: 'Stress Analysis',
          status: stressLevel,
          details: currentStress > 70 
            ? "Your stress level is high. Consider taking a break and practicing relaxation techniques."
            : currentStress > 40
            ? "Your stress level is moderate. Try some deep breathing exercises."
            : "Your stress level is normal. Keep up the good work!",
          recommendation: currentStress > 40 
            ? "• Practice deep breathing\n• Take a short walk\n• Listen to calming music\n• Try meditation"
            : "• Maintain your current routine\n• Regular exercise\n• Good sleep habits",
          exercises: {
            title: "Recommended Exercises for Your Stress Level",
            description: `Based on your current stress level (${currentStress}%), here are some targeted exercises:`,
            list: getStressExercises(currentStress)
          }
        };
      case 'temperature':
        return {
          title: 'Body Temperature Analysis',
          status: bodyTemperature > 37.5 
            ? "High"
            : bodyTemperature < 36 
            ? "Low" 
            : "Normal",
          details: bodyTemperature > 37.5
            ? "Your body temperature is above normal range. Monitor for other symptoms."
            : bodyTemperature < 36
            ? "Your body temperature is below normal range. Try to warm up."
            : "Your body temperature is within the normal range.",
          recommendation: bodyTemperature > 37.5
            ? "• Rest and hydrate\n• Monitor for other symptoms\n• Consult a doctor if persistent"
            : bodyTemperature < 36
            ? "• Warm up gradually\n• Wear warm clothing\n• Have warm beverages"
            : "• Maintain normal activities\n• Stay hydrated",
          tempInfo: {
            title: "Temperature Information",
            currentTemp: `Current Temperature: ${bodyTemperature.toFixed(1)}°C`,
            normalRange: "Normal body temperature range: 36.0°C - 37.5°C",
            interpretation: bodyTemperature > 37.5
              ? "Elevated temperature may indicate fever or overexertion"
              : bodyTemperature < 36
              ? "Low temperature may indicate cold exposure or reduced circulation"
              : "Your temperature is within healthy range",
          },
          exercises: {
            title: "Recommended Activities for Your Temperature",
            description: `Based on your current temperature (${bodyTemperature.toFixed(1)}°C), here are some suggested activities:`,
            list: getTemperatureExercises(bodyTemperature)
          }
        };
      case 'hrv':
        return {
          title: 'Heart Rate Variability Analysis',
          status: hrvValue < 30 
            ? "Low"
            : hrvValue > 150 
            ? "High" 
            : "Normal",
          details: hrvValue < 30
            ? "Your HRV is low, which might indicate stress or fatigue. Consider taking time to rest and recover."
            : hrvValue > 150
            ? "Your HRV is high, indicating good cardiovascular fitness and stress resilience."
            : "Your HRV is within a normal range, indicating good balance between stress and recovery.",
          recommendation: hrvValue < 30
            ? "• Prioritize rest and recovery\n• Practice stress management\n• Improve sleep quality\n• Consider reducing training intensity"
            : hrvValue > 150
            ? "• Maintain current lifestyle habits\n• Continue balanced exercise routine\n• Keep up good sleep patterns"
            : "• Maintain regular exercise\n• Practice stress management\n• Ensure adequate sleep",
          hrvInfo: {
            title: "Understanding Your HRV",
            description: "Heart Rate Variability (HRV) measures the variation in time between heartbeats. Higher HRV generally indicates better cardiovascular fitness and stress resilience.",
            currentValue: `Current HRV: ${hrvValue}ms`,
            interpretation: hrvValue < 30
              ? "Low HRV may indicate stress, poor recovery, or overtraining"
              : hrvValue > 150
              ? "High HRV suggests excellent cardiovascular health and stress resilience"
              : "Your HRV indicates a good balance between stress and recovery"
          }
        };
      default:
        return null;
    }
  };

  const renderAnalysisModal = () => {
    if (!selectedMetric) return null;
    const analysis = getAnalysisText(selectedMetric);
    if (!analysis) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedMetric}
        onRequestClose={() => setSelectedMetric(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{analysis.title}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedMetric(null)}
                style={styles.closeButton}
              >
                <FontAwesome6 name="xmark" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.analysisScrollView}>
              <View style={styles.analysisContainer}>
                <Text style={styles.statusText}>Status: {analysis.status}</Text>
                <Text style={styles.detailsText}>{analysis.details}</Text>
                
                <Text style={styles.recommendationTitle}>General Recommendations:</Text>
                <Text style={styles.recommendationText}>{analysis.recommendation}</Text>

                {analysis.tempInfo && (
                  <View style={styles.tempInfoSection}>
                    <Text style={styles.tempInfoTitle}>{analysis.tempInfo.title}</Text>
                    <Text style={[styles.tempInfoValue, { 
                      color: getTempColor(bodyTemperature),
                      fontSize: 24,
                      fontWeight: 'bold',
                      marginVertical: 10,
                    }]}>{analysis.tempInfo.currentTemp}</Text>
                    <Text style={styles.tempInfoRange}>{analysis.tempInfo.normalRange}</Text>
                    <Text style={styles.tempInfoInterpretation}>{analysis.tempInfo.interpretation}</Text>
                  </View>
                )}

                {analysis.exercises && (
                  <View style={styles.exercisesSection}>
                    <Text style={styles.exercisesTitle}>{analysis.exercises.title}</Text>
                    <Text style={styles.exercisesDescription}>{analysis.exercises.description}</Text>
                    <Text style={styles.exercisesList}>{analysis.exercises.list}</Text>
                  </View>
                )}

                {analysis.hrvInfo && (
                  <View style={styles.hrvInfoSection}>
                    <Text style={styles.hrvInfoTitle}>{analysis.hrvInfo.title}</Text>
                    <Text style={styles.hrvInfoDescription}>{analysis.hrvInfo.description}</Text>
                    <Text style={styles.hrvInfoCurrentValue}>{analysis.hrvInfo.currentValue}</Text>
                    <Text style={styles.hrvInfoInterpretation}>{analysis.hrvInfo.interpretation}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (!isStarted) {
    return <StartScreen onStart={() => setIsStarted(true)} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CalmPulse-Smart Stress Tracker and Guide</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Connected" : "Connect to Device"}
          onPress={connectToDevice}
        />
        <TouchableOpacity
          style={styles.relaxButton}
          onPress={openRelaxationHub}
        >
          <Text style={styles.relaxText}>Relaxation Hub</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dashboard}>
        <Text style={styles.stressLevel}>Stress Level: {stressLevel}</Text>
        <TouchableOpacity 
          onPress={() => setSelectedMetric('stress')}
          style={styles.progressContainer}
        >
          <AnimatedCircularProgress
            size={200}
            width={20}
            fill={currentStress}
            tintColor={getStressColor(stressLevel)}
            backgroundColor="#e0e0e0"
            rotation={0}
            lineCap="round"
          >
            {(fill) => (
              <View style={styles.progressContent}>
                <Text style={styles.percentText}>{`${Math.round(fill)}%`}</Text>
                <Text style={styles.stressLabel}>Stress Level</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </TouchableOpacity>

        <View style={styles.metricsContainer}>
          <TouchableOpacity 
            style={styles.metricItem}
            onPress={() => setSelectedMetric('temperature')}
          >
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={((bodyTemperature - 35) / (40 - 35)) * 100}
              tintColor="#4caf50"
              backgroundColor="#e0e0e0"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.smallProgressContent}>
                  <Text style={[
                    styles.smallPercentText,
                    {
                      fontSize: bodyTemperature > 37.5 ? 24 :
                               bodyTemperature < 36.0 ? 14 : 18,
                      fontWeight: 'bold',
                    }
                  ]}>{`${bodyTemperature.toFixed(1)}°C`}</Text>
                  <FontAwesome6 
                    name="temperature-three-quarters" 
                    size={24} 
                    color="#4caf50"
                    style={styles.iconStyle}
                  />
                </View>
              )}
            </AnimatedCircularProgress>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.metricItem}
            onPress={() => setSelectedMetric('hrv')}
          >
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={getHrvPercentage(hrvValue)}
              tintColor={getHrvColor(hrvValue)}
              backgroundColor="#e0e0e0"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.smallProgressContent}>
                  <Text style={styles.smallPercentText}>{`${hrvValue}ms`}</Text>
                  <FontAwesome6 
                    name="heart-pulse" 
                    size={24} 
                    color={getHrvColor(hrvValue)} 
                    style={styles.iconStyle}
                  />
                </View>
              )}
            </AnimatedCircularProgress>
          </TouchableOpacity>
        </View>
      </View>

      {renderAnalysisModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  relaxButton: {
    backgroundColor: "#4caf50",
    borderRadius: 5,
    padding: 10,
  },
  relaxText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dashboard: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    marginBottom: 20,
    alignItems: "center",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  progressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  stressLevel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  percentText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  stressLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  metricItem: {
    alignItems: "center",
  },
  smallProgressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  smallPercentText: {
    fontWeight: "bold",
    color: "#333",
    textAlign: 'center',
  },
  smallLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  symbolText: {
    fontSize: 20,
    marginTop: 2,
  },
  iconStyle: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  analysisContainer: {
    marginTop: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  analysisScrollView: {
    maxHeight: '80%',
  },
  exercisesSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  exercisesDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  exercisesList: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  hrvInfoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  hrvInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  hrvInfoDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  hrvInfoCurrentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  hrvInfoInterpretation: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  startContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  startSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  startIcon: {
    marginBottom: 5,
  },
  startDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    marginLeft: 5,
  },
  tempInfoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  tempInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tempInfoValue: {
    textAlign: 'center',
  },
  tempInfoRange: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  tempInfoInterpretation: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default App;
